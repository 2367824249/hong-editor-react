export interface EditorAction {
  getValue: () => string;
  setValue: (value: any) => void;
}