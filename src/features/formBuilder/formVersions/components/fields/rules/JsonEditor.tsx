import React, { useMemo, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface JsonEditorProps {
  id?: string;
  label?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function highlight(json: string) {
  const escaped = escapeHtml(json);
  return escaped
    .replace(/(".*?"\s*:\s*)/g, '<span class="text-blue-600">$1</span>')
    .replace(/(".*?")/g, '<span class="text-green-700">$1</span>')
    .replace(/\b(true|false)\b/g, '<span class="text-purple-700">$1</span>')
    .replace(/\b(null)\b/g, '<span class="text-gray-500">$1</span>')
    .replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span class="text-orange-700">$1</span>');
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
}) => {
  const [error, setError] = useState<string | null>(null);

  const pretty = useMemo(() => {
    if (!value) return '';
    try {
      const obj = JSON.parse(value);
      setError(null);
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      setError('Invalid JSON');
      return '';
    }
  }, [value]);

  const handleChange = (raw: string) => {
    const v = raw.trim();
    if (v.length === 0) {
      setError(null);
      onChange(null);
      return;
    }
    try {
      JSON.parse(v);
      setError(null);
      onChange(v);
    } catch (e) {
      setError('Invalid JSON');
      onChange(v);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
          {label}
        </Label>
      )}
      <Textarea
        id={id}
        value={value ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder ?? '{"key": "value"}'}
        className={`min-h-[80px] text-xs font-mono ${error ? 'border-destructive' : ''}`}
      />
      <div className="rounded border p-2 bg-gray-50">
        <pre
          className="text-xs font-mono overflow-auto"
          dangerouslySetInnerHTML={{ __html: highlight(pretty) }}
        />
      </div>
      {error && <p className="text-[10px] text-destructive">{error}</p>}
    </div>
  );
};

