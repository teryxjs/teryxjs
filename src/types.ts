// ============================================================
// Teryx — Type Definitions
// ============================================================

/** Base interface every widget instance implements. */
export interface WidgetInstance {
  /** Root DOM element of this widget. */
  el: HTMLElement;
  /** Tear down the widget and remove DOM content. */
  destroy(): void;
}

// ----------------------------------------------------------
//  Global config
// ----------------------------------------------------------
export interface TeryxConfig {
  /** CSS class prefix (default "tx"). */
  prefix: string;
  /** Auto-initialize declarative widgets on DOMContentLoaded. */
  autoInit: boolean;
  /** Default toast position. */
  toastPosition: ToastPosition;
  /** Default toast duration in ms. */
  toastDuration: number;
  /** Enable debug logging. */
  debug: boolean;
}

// ----------------------------------------------------------
//  Layout
// ----------------------------------------------------------
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export interface ContainerOptions {
  fluid?: boolean;
  class?: string;
  id?: string;
}

export interface RowOptions {
  gutter?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  class?: string;
}

export interface ColOptions {
  span?: number; // 1-12
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  offset?: number;
  class?: string;
}

// ----------------------------------------------------------
//  Grid / Table
// ----------------------------------------------------------
export interface GridColumn {
  /** JSON field name. */
  field: string;
  /** Display header text. */
  label: string;
  /** Allow sorting. */
  sortable?: boolean;
  /** Fixed width (CSS value). */
  width?: string;
  /** Min width (CSS value). */
  minWidth?: string;
  /** Flex grow factor. */
  flex?: number;
  /** Text alignment. */
  align?: 'left' | 'center' | 'right';
  /** Extra CSS class on <td>. */
  class?: string;
  /** Extra CSS class on <th>. */
  headerClass?: string;
  /** Custom xhtmlx template for cell content (replaces xh-text). */
  template?: string;
  /** Column is hidden. */
  hidden?: boolean;
  /** Column is resizable. */
  resizable?: boolean;
  /** Renderer type hint for built-in formatters. */
  renderer?: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'link' | 'image' | 'progress' | 'actions';
  /** Renderer config (depends on renderer type). */
  rendererConfig?: Record<string, unknown>;
  /** Filterable via column header filter. */
  filterable?: boolean;
  /** Filter type. */
  filterType?: 'text' | 'number' | 'date' | 'select' | 'boolean';
  /** Filter options (for select filter). */
  filterOptions?: { label: string; value: string }[];
  /** Editable inline. */
  editable?: boolean;
  /** Editor type. */
  editorType?: 'text' | 'number' | 'select' | 'checkbox' | 'date';
  /** Summary function for column footer. */
  summary?: 'sum' | 'avg' | 'min' | 'max' | 'count' | string;
  /** Locked column (always visible on scroll). */
  locked?: boolean;
  /** Groupable by this column. */
  groupable?: boolean;
}

export interface GridOptions {
  /** API source URL returning JSON. */
  source: string;
  /** Column definitions. */
  columns: GridColumn[];
  /** Enable search toolbar. */
  searchable?: boolean;
  /** Server-side pagination. */
  paginated?: boolean;
  /** Rows per page (default 25). */
  pageSize?: number;
  /** Available page sizes. */
  pageSizes?: number[];
  /** Empty state message. */
  emptyMessage?: string;
  /** Extra CSS class. */
  class?: string;
  /** Striped rows. */
  striped?: boolean;
  /** Highlight on hover. */
  hoverable?: boolean;
  /** Draw cell borders. */
  bordered?: boolean;
  /** Compact density. */
  compact?: boolean;
  /** Row CSS class or field name for dynamic class. */
  rowClass?: string;
  /** xh-trigger value (default "load"). */
  trigger?: string;
  /** Widget id. */
  id?: string;
  /** Query param for sort field. */
  sortParam?: string;
  /** Query param for sort order. */
  orderParam?: string;
  /** Query param for search. */
  searchParam?: string;
  /** Query param for page. */
  pageParam?: string;
  /** Query param for page size. */
  pageSizeParam?: string;
  /** Field in JSON response containing rows (default "rows"). */
  rowsField?: string;
  /** Field in JSON response containing total count. */
  totalField?: string;
  /** Enable row selection. */
  selectable?: boolean;
  /** Selection mode. */
  selectionMode?: 'single' | 'multi';
  /** Enable row drag-and-drop reorder. */
  reorderable?: boolean;
  /** Callback fired when a row is reordered via drag-and-drop. */
  onReorder?: (fromIndex: number, toIndex: number) => void;
  /** Enable column reorder via drag. */
  columnReorder?: boolean;
  /** Row expand template. */
  rowDetailTemplate?: string;
  /** Row detail source URL. */
  rowDetailSource?: string;
  /** Fixed header on scroll. */
  stickyHeader?: boolean;
  /** Max height with scroll. */
  maxHeight?: string;
  /** Enable infinite scroll instead of pagination. */
  infiniteScroll?: boolean;
  /** Tree grid — field containing children. */
  childrenField?: string;
  /** Show row numbers. */
  rowNumbers?: boolean;
  /** Toolbar items above the grid. */
  toolbar?: ToolbarItem[];
  /** Context menu items for rows. */
  contextMenu?: MenuItem[];
  /** Enable cell editing. */
  editable?: boolean;
  /** URL for saving edits. */
  editUrl?: string;
  /** Group by field. */
  groupBy?: string;
  /** Show summary row. */
  showSummary?: boolean;
  /** Enable export. */
  exportable?: boolean;
  /** Column visibility toggle menu. */
  columnMenu?: boolean;
}

export interface GridInstance extends WidgetInstance {
  reload(): void;
  getSelected(): unknown[];
  clearSelection(): void;
  setPage(page: number): void;
}

// ----------------------------------------------------------
//  Tree (TreePanel / TreeList)
// ----------------------------------------------------------
export interface TreeNode {
  id: string;
  text: string;
  icon?: string;
  children?: TreeNode[];
  leaf?: boolean;
  expanded?: boolean;
  checked?: boolean;
  cls?: string;
  href?: string;
  data?: Record<string, unknown>;
}

export interface TreeOptions {
  source?: string;
  nodes?: TreeNode[];
  selectable?: boolean;
  checkable?: boolean;
  draggable?: boolean;
  expandAll?: boolean;
  lines?: boolean;
  class?: string;
  id?: string;
  onSelect?: (node: TreeNode) => void;
  onCheck?: (node: TreeNode, checked: boolean) => void;
  lazyLoad?: boolean;
}

export interface TreeInstance extends WidgetInstance {
  expand(id: string): void;
  collapse(id: string): void;
  expandAll(): void;
  collapseAll(): void;
  getChecked(): TreeNode[];
  getSelected(): TreeNode | null;
}

// ----------------------------------------------------------
//  Form
// ----------------------------------------------------------
export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'hidden'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'color'
  | 'range'
  | 'combobox'
  | 'tag'
  | 'richtext'
  | 'code'
  | 'display';

export interface FormField {
  name: string;
  label?: string;
  type?: FieldType;
  placeholder?: string;
  required?: boolean;
  value?: unknown;
  options?: SelectOption[];
  helpText?: string;
  pattern?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  class?: string;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number;
  maxLength?: number;
  minLength?: number;
  multiple?: boolean;
  accept?: string;
  autocomplete?: string;
  prefix?: string;
  suffix?: string;
  icon?: string;
  colspan?: number;
  fieldGroup?: string;
  validators?: Validator[];
  transform?: string;
  dependsOn?: string;
  visibleWhen?: string;
}

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
  group?: string;
}

export interface Validator {
  type: 'required' | 'email' | 'url' | 'pattern' | 'minLength' | 'maxLength' | 'min' | 'max' | 'custom';
  message?: string;
  value?: unknown;
  fn?: (value: unknown) => boolean;
}

export interface FormOptions {
  action: string;
  method?: string;
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
  class?: string;
  id?: string;
  target?: string;
  swap?: string;
  indicator?: string;
  resetOnSuccess?: boolean;
  layout?: 'vertical' | 'horizontal' | 'inline';
  columns?: number;
  labelWidth?: string;
  fieldGroups?: { name: string; title: string; collapsible?: boolean }[];
  onSuccess?: () => void;
  onError?: (err: unknown) => void;
  onSubmit?: (data: Record<string, unknown>) => boolean;
  liveValidation?: boolean;
}

export interface FormInstance extends WidgetInstance {
  reset(): void;
  validate(): boolean;
  getData(): Record<string, unknown>;
  setData(data: Record<string, unknown>): void;
  setErrors(errors: Record<string, string>): void;
  clearErrors(): void;
  submit(): void;
  isValid(): boolean;
  getField(name: string): HTMLElement | null;
}

// ----------------------------------------------------------
//  Modal / Dialog / Window
// ----------------------------------------------------------
export interface ModalOptions {
  id?: string;
  title?: string;
  content?: string;
  source?: string;
  template?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  backdrop?: boolean | 'static';
  keyboard?: boolean;
  class?: string;
  headerClass?: string;
  bodyClass?: string;
  footerContent?: string;
  draggable?: boolean;
  resizable?: boolean;
  maximizable?: boolean;
  modal?: boolean;
  position?: { x: number; y: number } | 'center';
  width?: string;
  height?: string;
  minWidth?: string;
  minHeight?: string;
  buttons?: ModalButton[];
  onOpen?: () => void;
  onClose?: () => void;
  onResize?: (w: number, h: number) => void;
}

export interface ModalButton {
  label: string;
  variant?: ButtonVariant;
  action?: 'close' | 'submit' | string;
  handler?: () => void;
}

export interface ModalInstance extends WidgetInstance {
  open(): void;
  close(): void;
  isOpen(): boolean;
  setContent(html: string): void;
  setTitle(title: string): void;
  maximize(): void;
  restore(): void;
}

// ----------------------------------------------------------
//  Tabs / TabPanel
// ----------------------------------------------------------
export interface TabItem {
  id: string;
  title: string;
  content?: string;
  source?: string;
  icon?: string;
  active?: boolean;
  disabled?: boolean;
  closable?: boolean;
  badge?: string;
}

export interface TabsOptions {
  items: TabItem[];
  variant?: 'tabs' | 'pills' | 'underline' | 'card';
  class?: string;
  id?: string;
  vertical?: boolean;
  side?: 'left' | 'right';
  tabPosition?: 'top' | 'bottom' | 'left' | 'right';
  scrollable?: boolean;
  addable?: boolean;
  onChange?: (tabId: string) => void;
  onClose?: (tabId: string) => boolean;
  onAdd?: () => TabItem | null;
}

export interface TabsInstance extends WidgetInstance {
  activate(tabId: string): void;
  activeTab(): string;
  addTab(item: TabItem): void;
  removeTab(tabId: string): void;
  getTabs(): string[];
}

// ----------------------------------------------------------
//  Accordion
// ----------------------------------------------------------
export interface AccordionItem {
  id: string;
  title: string;
  content?: string;
  source?: string;
  icon?: string;
  open?: boolean;
  disabled?: boolean;
}

export interface AccordionOptions {
  items: AccordionItem[];
  multiple?: boolean;
  class?: string;
  id?: string;
  collapsible?: boolean;
  animated?: boolean;
  bordered?: boolean;
}

export interface AccordionInstance extends WidgetInstance {
  toggle(itemId: string): void;
  open(itemId: string): void;
  close(itemId: string): void;
  openAll(): void;
  closeAll(): void;
}

// ----------------------------------------------------------
//  Toolbar
// ----------------------------------------------------------
export type ToolbarItem =
  | ToolbarButton
  | ToolbarSeparator
  | ToolbarSpacer
  | ToolbarSearch
  | ToolbarSelect
  | ToolbarText;

export interface ToolbarButton {
  type: 'button';
  label?: string;
  icon?: string;
  variant?: ButtonVariant;
  action?: string;
  method?: string;
  target?: string;
  disabled?: boolean;
  tooltip?: string;
  menu?: MenuItem[];
}

export interface ToolbarSeparator {
  type: 'separator';
}
export interface ToolbarSpacer {
  type: 'spacer';
}
export interface ToolbarSearch {
  type: 'search';
  placeholder?: string;
  source?: string;
  target?: string;
  param?: string;
}
export interface ToolbarSelect {
  type: 'select';
  options: SelectOption[];
  value?: string;
  param?: string;
  source?: string;
  target?: string;
}
export interface ToolbarText {
  type: 'text';
  content: string;
}

export interface ToolbarOptions {
  items: ToolbarItem[];
  class?: string;
  id?: string;
  vertical?: boolean;
}

// ----------------------------------------------------------
//  Menu / Context Menu
// ----------------------------------------------------------
export interface MenuItem {
  label?: string;
  icon?: string;
  href?: string;
  action?: string;
  method?: string;
  target?: string;
  shortcut?: string;
  disabled?: boolean;
  checked?: boolean;
  children?: MenuItem[];
  divider?: boolean;
  handler?: (item: MenuItem) => void;
}

export interface MenuOptions {
  items: MenuItem[];
  trigger?: string | HTMLElement;
  event?: 'click' | 'contextmenu';
  align?: 'left' | 'right';
  class?: string;
  id?: string;
}

export interface MenuInstance extends WidgetInstance {
  open(x?: number, y?: number): void;
  close(): void;
  toggle(): void;
}

// ----------------------------------------------------------
//  Dropdown
// ----------------------------------------------------------
export interface DropdownOptions {
  trigger: string | HTMLElement;
  items: MenuItem[];
  align?: 'left' | 'right';
  class?: string;
  id?: string;
}

export interface DropdownInstance extends WidgetInstance {
  open(): void;
  close(): void;
  toggle(): void;
}

// ----------------------------------------------------------
//  Toast / Notification
// ----------------------------------------------------------
export type ToastPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';

export type ToastType = 'info' | 'success' | 'warning' | 'danger';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  title?: string;
  duration?: number;
  position?: ToastPosition;
  closable?: boolean;
  class?: string;
  icon?: string;
  action?: { label: string; handler: () => void };
}

// ----------------------------------------------------------
//  MessageBox / Confirm
// ----------------------------------------------------------
export interface MessageBoxOptions {
  title?: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'question' | 'success';
  buttons?: MessageBoxButton[];
  icon?: boolean;
  closable?: boolean;
  width?: string;
  onResult?: (button: string) => void;
}

export interface MessageBoxButton {
  text: string;
  value: string;
  variant?: ButtonVariant;
}

// ----------------------------------------------------------
//  Button
// ----------------------------------------------------------
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline-primary'
  | 'outline-secondary'
  | 'outline-success'
  | 'outline-warning'
  | 'outline-danger'
  | 'outline-info'
  | 'ghost'
  | 'link';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonOptions {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  action?: string;
  method?: string;
  target?: string;
  icon?: string;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  block?: boolean;
  class?: string;
  id?: string;
  type?: 'button' | 'submit' | 'reset';
  confirm?: string;
  tooltip?: string;
  badge?: string;
  menu?: MenuItem[];
}

// ----------------------------------------------------------
//  Card / Panel
// ----------------------------------------------------------
export interface CardOptions {
  title?: string;
  content?: string;
  source?: string;
  image?: string;
  imagePosition?: 'top' | 'bottom' | 'left' | 'overlay';
  footer?: string;
  class?: string;
  id?: string;
  headerActions?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  closable?: boolean;
  tools?: CardTool[];
  loading?: boolean;
}

export interface CardTool {
  icon: string;
  tooltip?: string;
  handler?: () => void;
  action?: string;
}

// ----------------------------------------------------------
//  Alert
// ----------------------------------------------------------
export interface AlertOptions {
  type?: 'info' | 'success' | 'warning' | 'danger';
  message: string;
  title?: string;
  dismissible?: boolean;
  class?: string;
  id?: string;
  icon?: boolean;
}

// ----------------------------------------------------------
//  Badge
// ----------------------------------------------------------
export interface BadgeOptions {
  text: string;
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  pill?: boolean;
  outline?: boolean;
  dot?: boolean;
  class?: string;
}

// ----------------------------------------------------------
//  Stat / KPI
// ----------------------------------------------------------
export interface StatOptions {
  label: string;
  value: string | number;
  source?: string;
  icon?: string;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  color?: string;
  class?: string;
  id?: string;
  sparkline?: number[];
  prefix?: string;
  suffix?: string;
}

// ----------------------------------------------------------
//  Progress
// ----------------------------------------------------------
export interface ProgressOptions {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  color?: string;
  striped?: boolean;
  animated?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  class?: string;
  id?: string;
  segments?: ProgressSegment[];
}

export interface ProgressSegment {
  value: number;
  color: string;
  label?: string;
}

// ----------------------------------------------------------
//  Breadcrumb
// ----------------------------------------------------------
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
  active?: boolean;
}

export interface BreadcrumbOptions {
  items: BreadcrumbItem[];
  separator?: string;
  class?: string;
}

// ----------------------------------------------------------
//  Pagination
// ----------------------------------------------------------
export interface PaginationOptions {
  total: number;
  current?: number;
  pageSize?: number;
  source?: string;
  target?: string;
  maxVisible?: number;
  showFirst?: boolean;
  showLast?: boolean;
  showSizeChanger?: boolean;
  pageSizes?: number[];
  showTotal?: boolean;
  showJumper?: boolean;
  class?: string;
  id?: string;
  simple?: boolean;
  onChange?: (page: number, pageSize: number) => void;
}

export interface PaginationInstance extends WidgetInstance {
  goTo(page: number): void;
  current(): number;
  setTotal(total: number): void;
}

// ----------------------------------------------------------
//  Navbar
// ----------------------------------------------------------
export interface NavItem {
  label: string;
  href?: string;
  active?: boolean;
  icon?: string;
  badge?: string;
  children?: NavItem[];
  disabled?: boolean;
  target?: string;
}

export interface NavbarOptions {
  brand?: string;
  brandHref?: string;
  brandImage?: string;
  items: NavItem[];
  endItems?: NavItem[];
  class?: string;
  id?: string;
  sticky?: boolean;
  variant?: 'light' | 'dark' | 'primary';
  container?: boolean;
  collapsible?: boolean;
}

// ----------------------------------------------------------
//  Sidebar
// ----------------------------------------------------------
export interface SidebarItem {
  label: string;
  href?: string;
  icon?: string;
  active?: boolean;
  badge?: string;
  badgeType?: string;
  children?: SidebarItem[];
  section?: boolean;
  disabled?: boolean;
}

export interface SidebarOptions {
  items: SidebarItem[];
  brand?: string;
  brandHref?: string;
  brandImage?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  mini?: boolean;
  width?: string;
  class?: string;
  id?: string;
  variant?: 'light' | 'dark';
  footer?: string;
}

export interface SidebarInstance extends WidgetInstance {
  collapse(): void;
  expand(): void;
  toggle(): void;
  isCollapsed(): boolean;
}

// ----------------------------------------------------------
//  DataList
// ----------------------------------------------------------
export interface DataListOptions {
  source: string;
  itemTemplate: string;
  itemsField?: string;
  trigger?: string;
  emptyMessage?: string;
  class?: string;
  id?: string;
  layout?: 'list' | 'grid';
  gridColumns?: number;
  gridGap?: string;
  paginated?: boolean;
  pageSize?: number;
  infinite?: boolean;
  selectable?: boolean;
}

// ----------------------------------------------------------
//  Autocomplete / ComboBox
// ----------------------------------------------------------
export interface AutocompleteOptions {
  source: string;
  minLength?: number;
  delay?: number;
  maxResults?: number;
  placeholder?: string;
  displayField?: string;
  valueField?: string;
  class?: string;
  id?: string;
  template?: string;
  onSelect?: (item: unknown) => void;
  multiSelect?: boolean;
  tags?: boolean;
  clearable?: boolean;
  creatable?: boolean;
}

export interface AutocompleteInstance extends WidgetInstance {
  clear(): void;
  value(): unknown;
  setValue(val: unknown): void;
  focus(): void;
}

// ----------------------------------------------------------
//  DatePicker
// ----------------------------------------------------------
export interface DatePickerOptions {
  value?: string;
  format?: string;
  min?: string;
  max?: string;
  placeholder?: string;
  class?: string;
  id?: string;
  range?: boolean;
  time?: boolean;
  inline?: boolean;
  disabledDates?: string[] | ((date: Date) => boolean);
  firstDay?: number;
  onChange?: (value: string) => void;
}

export interface DatePickerInstance extends WidgetInstance {
  getValue(): string;
  setValue(val: string): void;
  clear(): void;
  open(): void;
  close(): void;
}

// ----------------------------------------------------------
//  ColorPicker
// ----------------------------------------------------------
export interface ColorPickerOptions {
  value?: string;
  format?: 'hex' | 'rgb' | 'hsl';
  presets?: string[];
  class?: string;
  id?: string;
  onChange?: (color: string) => void;
}

// ----------------------------------------------------------
//  Slider / Range
// ----------------------------------------------------------
export interface SliderOptions {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  range?: boolean;
  values?: [number, number];
  vertical?: boolean;
  showTicks?: boolean;
  showTooltip?: boolean;
  showInput?: boolean;
  marks?: Record<number, string>;
  class?: string;
  id?: string;
  onChange?: (value: number | [number, number]) => void;
}

// ----------------------------------------------------------
//  Tooltip / Popover
// ----------------------------------------------------------
export interface TooltipOptions {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click' | 'focus';
  delay?: number;
  class?: string;
  html?: boolean;
}

export interface PopoverOptions extends TooltipOptions {
  title?: string;
  source?: string;
  width?: string;
  closable?: boolean;
}

// ----------------------------------------------------------
//  Tag / Chip
// ----------------------------------------------------------
export interface TagOptions {
  text: string;
  color?: string;
  closable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  class?: string;
  onClick?: () => void;
  onClose?: () => void;
}

// ----------------------------------------------------------
//  Tag Input / Chip Field
// ----------------------------------------------------------
export interface TagInputOptions {
  value?: string[];
  placeholder?: string;
  maxTags?: number;
  allowDuplicates?: boolean;
  clearable?: boolean;
  creatable?: boolean;
  suggestions?: string[];
  onChange?: (tags: string[]) => void;
  onAdd?: (tag: string) => void;
  onRemove?: (tag: string) => void;
  class?: string;
  id?: string;
}

export interface TagInputInstance extends WidgetInstance {
  getValue(): string[];
  setValue(tags: string[]): void;
  addTag(tag: string): void;
  removeTag(tag: string): void;
  clear(): void;
}

// ----------------------------------------------------------
//  Rich Text Editor
// ----------------------------------------------------------
export type RichEditorTool = 'bold' | 'italic' | 'underline' | '|' | 'ul' | 'ol' | 'link' | 'image' | 'clean';

export interface RichEditorOptions {
  value?: string;
  placeholder?: string;
  toolbar?: RichEditorTool[];
  readonly?: boolean;
  maxLength?: number;
  onChange?: (html: string) => void;
  class?: string;
  id?: string;
}

export interface RichEditorInstance extends WidgetInstance {
  getValue(): string;
  setValue(html: string): void;
}

// ----------------------------------------------------------
//  Avatar
// ----------------------------------------------------------
export interface AvatarOptions {
  src?: string;
  text?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square' | 'rounded';
  color?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  class?: string;
}

// ----------------------------------------------------------
//  Timeline
// ----------------------------------------------------------
export interface TimelineItem {
  title: string;
  content?: string;
  time?: string;
  icon?: string;
  color?: string;
  status?: 'completed' | 'active' | 'pending';
}

export interface TimelineOptions {
  items: TimelineItem[];
  source?: string;
  class?: string;
  id?: string;
  alternate?: boolean;
}

// ----------------------------------------------------------
//  Carousel
// ----------------------------------------------------------
export interface CarouselSlide {
  content?: string;
  image?: string;
  title?: string;
  description?: string;
}

export interface CarouselOptions {
  slides: CarouselSlide[];
  autoplay?: boolean;
  interval?: number;
  indicators?: boolean;
  arrows?: boolean;
  loop?: boolean;
  class?: string;
  id?: string;
}

export interface CarouselInstance extends WidgetInstance {
  next(): void;
  prev(): void;
  goTo(index: number): void;
  pause(): void;
  play(): void;
}

// ----------------------------------------------------------
//  FileUpload
// ----------------------------------------------------------
export interface FileUploadOptions {
  action: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  dragDrop?: boolean;
  preview?: boolean;
  class?: string;
  id?: string;
  method?: string;
  fieldName?: string;
  headers?: Record<string, string>;
  onUpload?: (file: File) => void;
  onComplete?: (response: unknown) => void;
  onError?: (error: unknown) => void;
}

// ----------------------------------------------------------
//  Splitter / Split Panel
// ----------------------------------------------------------
export interface SplitterOptions {
  orientation?: 'horizontal' | 'vertical';
  sizes?: number[];
  minSize?: number;
  maxSize?: number;
  gutterSize?: number;
  class?: string;
  id?: string;
  onResize?: (sizes: number[]) => void;
}

// ----------------------------------------------------------
//  Calendar
// ----------------------------------------------------------
export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
  data?: Record<string, unknown>;
}

export interface CalendarOptions {
  events?: CalendarEvent[];
  source?: string;
  view?: 'month' | 'week' | 'day' | 'agenda';
  date?: string;
  firstDay?: number;
  class?: string;
  id?: string;
  editable?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: string) => void;
  onViewChange?: (view: string, date: string) => void;
}

export interface CalendarInstance extends WidgetInstance {
  setView(view: 'month' | 'week' | 'day'): void;
  setDate(date: string): void;
  today(): void;
  next(): void;
  prev(): void;
  addEvent(event: CalendarEvent): void;
  removeEvent(id: string): void;
  getEvents(): CalendarEvent[];
}

// ----------------------------------------------------------
//  Kanban Board
// ----------------------------------------------------------
export interface KanbanColumn {
  id: string;
  title: string;
  items?: KanbanCard[];
  source?: string;
  color?: string;
  limit?: number;
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  labels?: string[];
  assignee?: string;
  priority?: string;
  data?: Record<string, unknown>;
}

export interface KanbanOptions {
  columns: KanbanColumn[];
  source?: string;
  class?: string;
  id?: string;
  draggable?: boolean;
  cardTemplate?: string;
  onMove?: (cardId: string, fromCol: string, toCol: string) => void;
  onCardClick?: (card: KanbanCard) => void;
}

// ----------------------------------------------------------
//  Pivot Grid
// ----------------------------------------------------------
export interface PivotOptions {
  source: string;
  rows: string[];
  columns: string[];
  values: { field: string; aggregate: 'sum' | 'avg' | 'count' | 'min' | 'max' }[];
  class?: string;
  id?: string;
}

// ----------------------------------------------------------
//  Gauge
// ----------------------------------------------------------
export interface GaugeOptions {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  thresholds?: { value: number; color: string }[];
  size?: 'sm' | 'md' | 'lg';
  class?: string;
  id?: string;
}

// ----------------------------------------------------------
//  Sparkline
// ----------------------------------------------------------
export interface SparklineOptions {
  data: number[];
  type?: 'line' | 'bar' | 'area';
  color?: string;
  width?: number;
  height?: number;
  class?: string;
}

// ----------------------------------------------------------
//  Empty / Placeholder
// ----------------------------------------------------------
export interface EmptyOptions {
  title?: string;
  message?: string;
  icon?: string;
  action?: { label: string; href?: string; handler?: () => void };
  class?: string;
}

// ----------------------------------------------------------
//  Skeleton / Loading placeholder
// ----------------------------------------------------------
export interface SkeletonOptions {
  lines?: number;
  avatar?: boolean;
  image?: boolean;
  width?: string;
  height?: string;
  animated?: boolean;
  class?: string;
  id?: string;
}

// ----------------------------------------------------------
//  Layout Panels
// ----------------------------------------------------------
export interface BorderLayoutOptions {
  north?: PanelRegion;
  south?: PanelRegion;
  east?: PanelRegion;
  west?: PanelRegion;
  center?: PanelRegion;
  class?: string;
  id?: string;
}

export interface PanelRegion {
  content?: string;
  source?: string;
  size?: string;
  minSize?: string;
  maxSize?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  resizable?: boolean;
  split?: boolean;
  title?: string;
  class?: string;
}

// ----------------------------------------------------------
//  Rating / Stars
// ----------------------------------------------------------
export interface RatingOptions {
  value?: number;
  max?: number;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  class?: string;
  id?: string;
  onChange?: (value: number) => void;
}

// ----------------------------------------------------------
//  Transfer List
// ----------------------------------------------------------
export interface TransferOptions {
  source: { label: string; value: string; disabled?: boolean }[];
  target?: string[];
  titles?: [string, string];
  searchable?: boolean;
  class?: string;
  id?: string;
  onChange?: (targetKeys: string[]) => void;
}

// ----------------------------------------------------------
//  Steps / Wizard
// ----------------------------------------------------------
export interface StepItem {
  title: string;
  description?: string;
  icon?: string;
  content?: string;
  source?: string;
  status?: 'wait' | 'process' | 'finish' | 'error';
}

export interface StepsOptions {
  items: StepItem[];
  current?: number;
  direction?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md';
  class?: string;
  id?: string;
  onChange?: (step: number) => void;
  clickable?: boolean;
}

export interface StepsInstance extends WidgetInstance {
  next(): void;
  prev(): void;
  goTo(step: number): void;
  current(): number;
}

// ----------------------------------------------------------
//  Drawer
// ----------------------------------------------------------
export interface DrawerOptions {
  title?: string;
  content?: string;
  source?: string;
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: string;
  closable?: boolean;
  backdrop?: boolean | 'static';
  class?: string;
  id?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface DrawerInstance extends WidgetInstance {
  open(): void;
  close(): void;
  isOpen(): boolean;
}

// ----------------------------------------------------------
//  Popconfirm
// ----------------------------------------------------------
export interface PopconfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  position?: 'top' | 'bottom' | 'left' | 'right';
  icon?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// ----------------------------------------------------------
//  Segmented Control
// ----------------------------------------------------------
export interface SegmentedOptions {
  items: { label: string; value: string; icon?: string; disabled?: boolean }[];
  value?: string;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  class?: string;
  id?: string;
  onChange?: (value: string) => void;
}

// ----------------------------------------------------------
//  Mentions
// ----------------------------------------------------------
export interface MentionsOptions {
  source: string;
  trigger?: string;
  displayField?: string;
  valueField?: string;
  placeholder?: string;
  class?: string;
  id?: string;
  onSelect?: (item: unknown) => void;
}

// ----------------------------------------------------------
//  Cascader
// ----------------------------------------------------------
export interface CascaderOption {
  label: string;
  value: string;
  children?: CascaderOption[];
  disabled?: boolean;
  leaf?: boolean;
}

export interface CascaderOptions {
  options?: CascaderOption[];
  source?: string;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  class?: string;
  id?: string;
  onChange?: (value: string[]) => void;
}

// ----------------------------------------------------------
//  Descriptions / Property Grid
// ----------------------------------------------------------
export interface DescriptionItem {
  label: string;
  value?: string;
  field?: string;
  colspan?: number;
}

export interface DescriptionsOptions {
  items: DescriptionItem[];
  source?: string;
  title?: string;
  columns?: number;
  bordered?: boolean;
  size?: 'sm' | 'md' | 'lg';
  class?: string;
  id?: string;
  layout?: 'horizontal' | 'vertical';
}

// ----------------------------------------------------------
//  Result
// ----------------------------------------------------------
export interface ResultOptions {
  status: 'success' | 'error' | 'info' | 'warning' | '403' | '404' | '500';
  title: string;
  subtitle?: string;
  extra?: string;
  class?: string;
}

// ----------------------------------------------------------
//  Watermark
// ----------------------------------------------------------
export interface WatermarkOptions {
  text: string;
  fontSize?: number;
  color?: string;
  rotate?: number;
  gap?: [number, number];
  class?: string;
}

// ----------------------------------------------------------
//  ScrollSpy
// ----------------------------------------------------------
export interface ScrollSpyOptions {
  items: { id: string; label: string }[];
  offset?: number;
  class?: string;
  onChange?: (activeId: string) => void;
}

// ----------------------------------------------------------
//  Image Viewer / Lightbox
// ----------------------------------------------------------
export interface LightboxOptions {
  images: { src: string; alt?: string; caption?: string }[];
  startIndex?: number;
  zoom?: boolean;
  rotate?: boolean;
  class?: string;
}
