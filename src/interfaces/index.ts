export interface ShouldHandle<T> extends Handle<T> {
  shouldHandle(): boolean;
}

export interface Handle<T> {
  handle(): T;
}
