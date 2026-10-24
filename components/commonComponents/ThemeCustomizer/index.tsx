'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useSidebar } from '@/components/ui/sidebar';
import { getAvailableColors, ThemeColor } from '@/config/theme-colors';
import { HiOutlineCog6Tooth, HiOutlineXMark, HiOutlinePaintBrush, HiOutlineMoon, HiOutlineSun, HiOutlineViewColumns, HiOutlineBars3BottomLeft, HiOutlineBars3, HiOutlineArrowPath, HiOutlineBeaker, HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import { toast } from 'sonner';
import { authApi } from '@/lib/api/global-http';
import { defaultThemeConfig, type ThemeConfig } from '@/config/theme-config';

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const { config, setConfig } = useTheme();
  const [draft, setDraft] = useState<ThemeConfig>(config);
  const [isSaving, setIsSaving] = useState(false);
  const { state: sidebarState, setOpen: setSidebarOpen } = useSidebar();
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const buttonColorPickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setDraft(config);
  }, [config, isOpen]);

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(config);

  const handleApply = async () => {
    if (!hasChanges || isSaving) return;

    setIsSaving(true);
    try {
      const response = await authApi.getInstance().put<{ content: ThemeConfig }>("/theme", { config: draft });
      setConfig(response.data.content);
      toast.success('Theme applied and saved');
      setIsOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save theme settings';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const availableColors = getAvailableColors();

  const handleCustomColorChange = (color: string) => {
    setDraft((current) => ({ ...current, customColor: color }));
  };

  const handleCustomButtonColorChange = (color: string) => {
    setDraft((current) => ({ ...current, customButtonColor: color }));
  };

  const colorDisplayNames: Record<ThemeColor, string> = {
    blue: 'Blue',
    green: 'Green',
    yellow: 'Yellow',
    red: 'Red',
    purple: 'Purple',
  };

  const colorPreview: Record<ThemeColor, string> = {
    blue: '#008dff',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    purple: '#8b5cf6',
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="theme-customizer-toggle"
        aria-label="Open Theme Customizer"
      >
        <HiOutlineCog6Tooth />
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="theme-customizer-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`theme-customizer-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="theme-customizer-header">
          <div className="flex items-center gap-1.5">
            <HiOutlineCog6Tooth className="w-4 h-4" />
            <h2 className="font-semibold">Theme Customizer</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="close-button"
            aria-label="Close"
          >
            <HiOutlineXMark className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="theme-customizer-content">
          {/* Primary Color */}
          <div className="theme-section">
            <div className="section-header">
              <HiOutlinePaintBrush className="w-4 h-4" />
              <h3 className="section-title">Primary Color</h3>
            </div>
            <div className="color-grid">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setDraft((current) => ({ ...current, primaryColor: color, customColor: undefined }))}
                  className={`color-option ${draft.primaryColor === color && !draft.customColor ? 'active' : ''}`}
                  title={colorDisplayNames[color]}
                >
                  <div
                    className="color-circle"
                    style={{ backgroundColor: colorPreview[color] }}
                  />
                  {/* <span className="color-name">{colorDisplayNames[color]}</span> */}
                  {config.primaryColor === color && !config.customColor && (
                    <div className="check-mark">✓</div>
                  )}
                </button>
              ))}
              {/* Custom Color Picker */}
              <button
                onClick={() => colorPickerRef.current?.click()}
                className={`color-option ${config.customColor ? 'active' : ''}`}
                title="Choose Custom Color"
              >
                <div
                  className="color-circle"
                  style={{
                    backgroundColor: draft.customColor || '#666',
                    border: draft.customColor ? 'none' : '2px dashed var(--border)'
                  }}
                >
                  {!draft.customColor && <HiOutlineBeaker className="w-5 h-5 text-white" />}
                </div>
                {/* <span className="color-name">Custom</span> */}
                {draft.customColor && (
                  <div className="check-mark">✓</div>
                )}
              </button>
              <input
                ref={colorPickerRef}
                type="color"
                value={draft.customColor || '#008dff'}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="hidden-color-input"
                aria-label="Custom color picker"
              />
            </div>
          </div>

          {/* Button Primary Color */}
          <div className="theme-section">
            <div className="section-header">
              <HiOutlinePaintBrush className="w-4 h-4" />
              <h3 className="section-title">Button Primary Color</h3>
            </div>
            <div className="color-grid">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setDraft((current) => ({ ...current, buttonPrimaryColor: color, customButtonColor: undefined }))}
                  className={`color-option ${draft.buttonPrimaryColor === color && !draft.customButtonColor ? 'active' : ''}`}
                  title={colorDisplayNames[color]}
                >
                  <div
                    className="color-circle"
                    style={{ backgroundColor: colorPreview[color] }}
                  />
                  {config.buttonPrimaryColor === color && !config.customButtonColor && (
                    <div className="check-mark">✓</div>
                  )}
                </button>
              ))}
              {/* Custom Button Color Picker */}
              <button
                onClick={() => buttonColorPickerRef.current?.click()}
                className={`color-option ${config.customButtonColor ? 'active' : ''}`}
                title="Choose Custom Button Color"
              >
                <div
                  className="color-circle"
                  style={{
                    backgroundColor: draft.customButtonColor || '#666',
                    border: draft.customButtonColor ? 'none' : '2px dashed var(--border)'
                  }}
                >
                  {!draft.customButtonColor && <HiOutlineBeaker className="w-5 h-5 text-white" />}
                </div>
                {draft.customButtonColor && (
                  <div className="check-mark">✓</div>
                )}
              </button>
              <input
                ref={buttonColorPickerRef}
                type="color"
                value={draft.customButtonColor || '#008dff'}
                onChange={(e) => handleCustomButtonColorChange(e.target.value)}
                className="hidden-color-input"
                aria-label="Custom button color picker"
              />
            </div>
          </div>

          {/* Mode (Light/Dark) */}
          <div className="theme-section">
            <div className="section-header">
              {draft.mode === 'light' ? (
                <HiOutlineSun className="w-4 h-4" />
              ) : (
                <HiOutlineMoon className="w-4 h-4" />
              )}
              <h3 className="section-title">Mode</h3>
            </div>
            <div className="option-grid">
              <button
                onClick={() => setDraft((current) => ({ ...current, mode: 'light' }))}
                className={`option-button ${draft.mode === 'light' ? 'active' : ''}`}
              >
                <HiOutlineSun className="w-4 h-4" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setDraft((current) => ({ ...current, mode: 'dark' }))}
                className={`option-button ${draft.mode === 'dark' ? 'active' : ''}`}
              >
                <HiOutlineMoon className="w-4 h-4" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Sidebar Layout */}
          <div className="theme-section">
            <div className="section-header">
              <HiOutlineViewColumns className="w-4 h-4" />
              <h3 className="section-title">Sidebar</h3>
            </div>
            <div className="option-grid">
              <button
                onClick={() => setSidebarOpen(true)}
                className={`option-button ${sidebarState === 'expanded' ? 'active' : ''}`}
              >
                <HiOutlineBars3BottomLeft className="w-4 h-4" />
                <span>Expanded</span>
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`option-button ${sidebarState === 'collapsed' ? 'active' : ''}`}
              >
                <HiOutlineBars3 className="w-4 h-4" />
                <span>Collapsed</span>
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div className="theme-section bg-sidebar-accent p-2 rounded-md">
            <div className="section-header">
              <HiOutlineAdjustmentsHorizontal className="w-4 h-4" />
              <h3 className="section-title">Font Size</h3>
            </div>

            {/* Scale Container */}
            <div className="font-size-scale">

              {/* Slider */}
              <div className="font-size-control">
                <input
                  type="range"
                  id="font-size-slider"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={draft.fontSize || 1}
                  onChange={(e) => setDraft((current) => ({ ...current, fontSize: parseFloat(e.target.value) }))}
                  className="font-size-slider"
                  aria-label="Adjust font size"
                />
              </div>

              {/* Scale Markers */}
              <div className="scale-markers">
                {[0.8, 0.9, 1.0, 1.1, 1.2, 1.3].map((mark) => (
                  <div key={mark} className="scale-marker">
                    {/* <div className={`scale-tick ${mark === 1.0 ? 'default' : ''}`} /> */}
                    <span className="scale-label">{mark.toFixed(1)}x</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div className="theme-customizer-footer">
          <button
            type="button"
            className="reset-button"
            disabled={isSaving}
            onClick={() => {
              toast.warning("Reset theme to default?", {
                description: "Default settings will be staged until you apply them.",
                action: {
                  label: "Reset",
                  onClick: () => {
                    setDraft(defaultThemeConfig);
                    toast.success("Default theme staged", {
                      description: "Click Apply to save these settings",
                    });
                  },
                },
                cancel: {
                  label: "Cancel",
                  onClick: () => {},
                },
              });
            }}
          >
            <HiOutlineArrowPath className="w-4 h-4" />
            <span>Reset to Default</span>
          </button>
          <button
            type="button"
            className="apply-button"
            onClick={handleApply}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? 'Applying...' : 'Apply'}
          </button>
        </div>
      </div>
    </>
  );
}
