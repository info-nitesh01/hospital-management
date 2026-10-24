# Shadcn MCP Server

This MCP (Model Context Protocol) server provides tools for managing shadcn/ui components in your Next.js project through Claude.

## Features

The MCP server provides the following tools:

### 1. `add_component`
Add a shadcn/ui component to your project.
- **Parameters:**
  - `component`: Name of the component to add (e.g., 'button', 'card', 'dialog')
  - `overwrite`: Whether to overwrite existing files (default: false)

### 2. `list_components`
List all available shadcn/ui components that can be installed.

### 3. `list_installed_components`
List all currently installed shadcn/ui components in your project.

### 4. `get_theme_config`
Get the current theme configuration from components.json.

### 5. `update_theme_config`
Update theme settings in components.json.
- **Parameters:**
  - `style`: Style preset ('default' or 'new-york')
  - `baseColor`: Base color for the theme ('slate', 'gray', 'zinc', 'neutral', 'stone')
  - `cssVariables`: Use CSS variables for theming (true/false)

## Setup

1. The MCP server is already configured in your project. The dependencies have been installed:
   - `@modelcontextprotocol/sdk`: MCP SDK for building the server
   - `tsx`: TypeScript runtime for executing the server

2. To use with Claude Desktop, add the following to your Claude configuration:
   ```json
   {
     "mcpServers": {
       "shadcn": {
         "command": "npm",
         "args": ["run", "mcp"],
         "cwd": "/path/to/your/docu"
       }
     }
   }
   ```

## Usage

### Running the MCP Server Standalone

```bash
npm run mcp
```

### Using with Claude

Once configured, you can ask Claude to:
- "Add the button component to my project"
- "List all available shadcn components"
- "Show me which components are installed"
- "Update the theme to use the zinc color scheme"
- "Change the style to new-york"

## Development

To modify the MCP server, edit the `index.ts` file. The server:
1. Checks for proper shadcn/ui setup (components.json)
2. Uses the shadcn CLI to add components
3. Reads and updates configuration files
4. Provides component discovery features

## Troubleshooting

- **"Project is not set up with shadcn/ui"**: Run `npx shadcn@latest init` first
- **Component not found**: Check available components with `list_components` tool
- **Permission errors**: Ensure you have write permissions in the project directory