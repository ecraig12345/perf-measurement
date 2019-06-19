export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export interface Header {
  id: string;
  title: string;
}

export interface SummaryCallRecord {}
