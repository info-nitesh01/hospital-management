#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// Available shadcn components
const SHADCN_COMPONENTS = [
  'accordion', 'alert', 'alert-dialog', 'aspect-ratio', 'avatar',
  'badge', 'breadcrumb', 'button', 'calendar', 'card', 'carousel',
  'chart', 'checkbox', 'collapsible', 'combobox', 'command',
  'context-menu', 'data-table', 'date-picker', 'dialog', 'drawer',
  'dropdown-menu', 'form', 'hover-card', 'input', 'label',
  'menubar', 'navigation-menu', 'pagination', 'popover', 'progress',
  'radio-group', 'resizable', 'scroll-area', 'select', 'separator',
  'sheet', 'skeleton', 'slider', 'sonner', 'switch', 'table',
  'tabs', 'textarea', 'toast', 'toggle', 'toggle-group', 'tooltip'
];

class ShadcnMcpServer {
  private server: Server;
  private projectRoot: string;

  constructor() {
    this.server = new Server(
      {
        name: 'shadcn-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.projectRoot = process.cwd();
    this.setupHandlers();
  }

  private async checkProjectSetup(): Promise<boolean> {
    try {
      const componentsJsonPath = path.join(this.projectRoot, 'components.json');
      await fs.access(componentsJsonPath);
      return true;
    } catch {
      return false;
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'add_component',
          description: 'Add a shadcn/ui component to the project',
          inputSchema: {
            type: 'object',
            properties: {
              component: {
                type: 'string',
                description: 'Name of the component to add',
                enum: SHADCN_COMPONENTS,
              },
              overwrite: {
                type: 'boolean',
                description: 'Overwrite existing files',
                default: false,
              },
            },
            required: ['component'],
          },
        },
        {
          name: 'list_components',
          description: 'List all available shadcn/ui components',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'list_installed_components',
          description: 'List installed shadcn/ui components in the project',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_theme_config',
          description: 'Get the current theme configuration from components.json',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'update_theme_config',
          description: 'Update theme configuration in components.json',
          inputSchema: {
            type: 'object',
            properties: {
              style: {
                type: 'string',
                description: 'Style preset',
                enum: ['default', 'new-york'],
              },
              baseColor: {
                type: 'string',
                description: 'Base color for the theme',
                enum: ['slate', 'gray', 'zinc', 'neutral', 'stone'],
              },
              cssVariables: {
                type: 'boolean',
                description: 'Use CSS variables for theming',
              },
            },
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      // Check if project is set up properly
      const isSetup = await this.checkProjectSetup();
      if (!isSetup && name !== 'list_components') {
        throw new McpError(
          ErrorCode.InvalidRequest,
          'Project is not set up with shadcn/ui. Please run: npx shadcn@latest init'
        );
      }

      switch (name) {
        case 'add_component': {
          const { component, overwrite } = args as {
            component: string;
            overwrite?: boolean;
          };

          if (!SHADCN_COMPONENTS.includes(component)) {
            throw new McpError(
              ErrorCode.InvalidParams,
              `Unknown component: ${component}`
            );
          }

          try {
            const command = `npx shadcn@latest add ${component} ${
              overwrite ? '--overwrite' : ''
            } --yes`;

            const { stdout, stderr } = await execAsync(command, {
              cwd: this.projectRoot,
            });

            return {
              content: [
                {
                  type: 'text',
                  text: `Successfully added ${component} component.\n${stdout}${
                    stderr ? `\nWarnings: ${stderr}` : ''
                  }`,
                },
              ],
            };
          } catch (error) {
            throw new McpError(
              ErrorCode.InternalError,
              `Failed to add component: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }

        case 'list_components': {
          return {
            content: [
              {
                type: 'text',
                text: `Available shadcn/ui components:\n${SHADCN_COMPONENTS.join(
                  '\n'
                )}`,
              },
            ],
          };
        }

        case 'list_installed_components': {
          try {
            const uiPath = path.join(this.projectRoot, 'components', 'ui');
            const files = await fs.readdir(uiPath);
            const components = files
              .filter((file) => file.endsWith('.tsx'))
              .map((file) => file.replace('.tsx', ''));

            return {
              content: [
                {
                  type: 'text',
                  text: `Installed components:\n${
                    components.length > 0
                      ? components.join('\n')
                      : 'No components installed yet'
                  }`,
                },
              ],
            };
          } catch {
            return {
              content: [
                {
                  type: 'text',
                  text: 'No components installed yet',
                },
              ],
            };
          }
        }

        case 'get_theme_config': {
          try {
            const configPath = path.join(this.projectRoot, 'components.json');
            const config = await fs.readFile(configPath, 'utf-8');
            return {
              content: [
                {
                  type: 'text',
                  text: `Current theme configuration:\n${config}`,
                },
              ],
            };
          } catch (error) {
            throw new McpError(
              ErrorCode.InternalError,
              `Failed to read theme config: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }

        case 'update_theme_config': {
          const updates = args as {
            style?: string;
            baseColor?: string;
            cssVariables?: boolean;
          };

          try {
            const configPath = path.join(this.projectRoot, 'components.json');
            const configText = await fs.readFile(configPath, 'utf-8');
            const config = JSON.parse(configText);

            if (updates.style) config.style = updates.style;
            if (updates.baseColor) config.tailwind.baseColor = updates.baseColor;
            if (updates.cssVariables !== undefined)
              config.tailwind.cssVariables = updates.cssVariables;

            await fs.writeFile(
              configPath,
              JSON.stringify(config, null, 2),
              'utf-8'
            );

            return {
              content: [
                {
                  type: 'text',
                  text: `Theme configuration updated successfully`,
                },
              ],
            };
          } catch (error) {
            throw new McpError(
              ErrorCode.InternalError,
              `Failed to update theme config: ${error instanceof Error ? error.message : String(error)}`
            );
          }
        }

        default:
          throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Shadcn MCP server running on stdio');
  }
}

const server = new ShadcnMcpServer();
server.run().catch(console.error);