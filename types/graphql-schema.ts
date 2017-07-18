// tslint:disable
export enum AddTodoPayload {};
export enum ChangeTodoStatusPayload {};
export enum MarkAllTodosPayload {};
export enum PageInfo {};
export enum RemoveCompletedTodosPayload {};
export enum RemoveTodoPayload {};
export enum RenameTodoPayload {};
export enum Todo {};
export enum TodoConnection {};
export enum TodoEdge {};
export enum User {};
export enum Query {};
export enum Mutation {};

export interface AddTodoInput {
  clientMutationId?: string | null;
  text: string;
}

export interface ChangeTodoStatusInput {
  clientMutationId?: string | null;
  complete: boolean;
  id: string;
}

export interface MarkAllTodosInput {
  clientMutationId?: string | null;
  complete: boolean;
}

export interface RemoveCompletedTodosInput {
  clientMutationId?: string | null;
}

export interface RemoveTodoInput {
  clientMutationId?: string | null;
  id: string;
}

export interface RenameTodoInput {
  clientMutationId?: string | null;
  id: string;
  text: string;
}



export type NodeTypeNames = "User" | "Todo";





