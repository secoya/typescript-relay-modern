import * as ReactRelay from 'react-relay/definitions';
import { AddTodoMutation as AddTodoMutationPayload, AddTodoMutationVariables } from 'generated/AddTodoMutation.graphql';
import { ChangeTodoStatusMutation as ChangeTodoStatusMutationPayload, ChangeTodoStatusMutationVariables } from 'generated/ChangeTodoStatusMutation.graphql';
import { MarkAllTodosMutation as MarkAllTodosMutationPayload, MarkAllTodosMutationVariables } from 'generated/MarkAllTodosMutation.graphql';
import { RemoveCompletedTodosMutation as RemoveCompletedTodosMutationPayload, RemoveCompletedTodosMutationVariables } from 'generated/RemoveCompletedTodosMutation.graphql';
import { RemoveTodoMutation as RemoveTodoMutationPayload, RemoveTodoMutationVariables } from 'generated/RemoveTodoMutation.graphql';
import { RenameTodoMutation as RenameTodoMutationPayload, RenameTodoMutationVariables } from 'generated/RenameTodoMutation.graphql';
import { appQuery as appQueryPayload } from 'generated/appQuery.graphql';
import { TodoListFooter_viewer, TodoListFooter_viewer_brand } from 'generated/TodoListFooter_viewer.graphql';
import { TodoList_viewer, TodoList_viewer_brand } from 'generated/TodoList_viewer.graphql';
import { Todo_todo, Todo_todo_brand } from 'generated/Todo_todo.graphql';
import { Todo_viewer, Todo_viewer_brand } from 'generated/Todo_viewer.graphql';
import { TodoApp_viewer, TodoApp_viewer_brand } from 'generated/TodoApp_viewer.graphql';

declare global {
  namespace Relay {
    export interface AddTodoMutation {
      query: AddTodoMutationPayload;
      variables: AddTodoMutationVariables;
    }
    export interface ChangeTodoStatusMutation {
      query: ChangeTodoStatusMutationPayload;
      variables: ChangeTodoStatusMutationVariables;
    }
    export interface MarkAllTodosMutation {
      query: MarkAllTodosMutationPayload;
      variables: MarkAllTodosMutationVariables;
    }
    export interface RemoveCompletedTodosMutation {
      query: RemoveCompletedTodosMutationPayload;
      variables: RemoveCompletedTodosMutationVariables;
    }
    export interface RemoveTodoMutation {
      query: RemoveTodoMutationPayload;
      variables: RemoveTodoMutationVariables;
    }
    export interface RenameTodoMutation {
      query: RenameTodoMutationPayload;
      variables: RenameTodoMutationVariables;
    }
    export interface appQuery {
      query: appQueryPayload;
      variables: {};
    }

    export type TodoListFooterFragmentContainerProps<Props> = ReactRelay.FragmentContainerProps<{ viewer: TodoListFooter_viewer }
, Props>
    export abstract class TodoListFooterFragmentContainer<Props = {}, State = {}> extends ReactRelay.FragmentContainer<{ viewer: TodoListFooter_viewer }, { viewer: TodoListFooter_viewer_brand }, Props, State> { }
    export type TodoListFooterRefetchContainerProps<Props, RefetchQuery extends ReactRelay.BaseQuery> = ReactRelay.RefetchContainerProps<{ viewer: TodoListFooter_viewer }
, Props, RefetchQuery>
    export abstract class TodoListFooterRefetchContainer<RefetchQuery extends ReactRelay.BaseQuery, Props = {}, State = {}> extends ReactRelay.RefetchContainer<{ viewer: TodoListFooter_viewer }, { viewer: TodoListFooter_viewer_brand }, Props, State, RefetchQuery> { }
    export type TodoListFooterPaginationContainerProps<Props, PaginationQuery extends ReactRelay.BaseQuery> = ReactRelay.PaginationContainerProps<{ viewer: TodoListFooter_viewer }
, Props, PaginationQuery>
    export abstract class TodoListFooterPaginationContainer<PaginationQuery extends ReactRelay.BaseQuery, Props = {}, State = {}> extends ReactRelay.PaginationContainer<{ viewer: TodoListFooter_viewer }, { viewer: TodoListFooter_viewer_brand }, Props, State, PaginationQuery> { }
    export type TodoListFragmentContainerProps<Props> = ReactRelay.FragmentContainerProps<{ viewer: TodoList_viewer }
, Props>
    export abstract class TodoListFragmentContainer<Props = {}, State = {}> extends ReactRelay.FragmentContainer<{ viewer: TodoList_viewer }, { viewer: TodoList_viewer_brand }, Props, State> { }
    export type TodoListRefetchContainerProps<Props, RefetchQuery extends ReactRelay.BaseQuery> = ReactRelay.RefetchContainerProps<{ viewer: TodoList_viewer }
, Props, RefetchQuery>
    export abstract class TodoListRefetchContainer<RefetchQuery extends ReactRelay.BaseQuery, Props = {}, State = {}> extends ReactRelay.RefetchContainer<{ viewer: TodoList_viewer }, { viewer: TodoList_viewer_brand }, Props, State, RefetchQuery> { }
    export type TodoListPaginationContainerProps<Props, PaginationQuery extends ReactRelay.BaseQuery> = ReactRelay.PaginationContainerProps<{ viewer: TodoList_viewer }
, Props, PaginationQuery>
    export abstract class TodoListPaginationContainer<PaginationQuery extends ReactRelay.BaseQuery, Props = {}, State = {}> extends ReactRelay.PaginationContainer<{ viewer: TodoList_viewer }, { viewer: TodoList_viewer_brand }, Props, State, PaginationQuery> { }
    export type TodoFragmentContainerProps<Props> = ReactRelay.FragmentContainerProps<{ todo: Todo_todo } & { viewer: Todo_viewer }
, Props>
    export abstract class TodoFragmentContainer<Props = {}, State = {}> extends ReactRelay.FragmentContainer<{ todo: Todo_todo } & { viewer: Todo_viewer }, { todo: Todo_todo_brand } & { viewer: Todo_viewer_brand }, Props, State> { }
    export type TodoRefetchContainerProps<Props, RefetchQuery extends ReactRelay.BaseQuery> = ReactRelay.RefetchContainerProps<{ todo: Todo_todo } & { viewer: Todo_viewer }
, Props, RefetchQuery>
    export abstract class TodoRefetchContainer<RefetchQuery extends ReactRelay.BaseQuery, Props = {}, State = {}> extends ReactRelay.RefetchContainer<{ todo: Todo_todo } & { viewer: Todo_viewer }, { todo: Todo_todo_brand } & { viewer: Todo_viewer_brand }, Props, State, RefetchQuery> { }
    export type TodoPaginationContainerProps<Props, PaginationQuery extends ReactRelay.BaseQuery> = ReactRelay.PaginationContainerProps<{ todo: Todo_todo } & { viewer: Todo_viewer }
, Props, PaginationQuery>
    export abstract class TodoPaginationContainer<PaginationQuery extends ReactRelay.BaseQuery, Props = {}, State = {}> extends ReactRelay.PaginationContainer<{ todo: Todo_todo } & { viewer: Todo_viewer }, { todo: Todo_todo_brand } & { viewer: Todo_viewer_brand }, Props, State, PaginationQuery> { }
    export type TodoAppFragmentContainerProps<Props> = ReactRelay.FragmentContainerProps<{ viewer: TodoApp_viewer }
, Props>
    export abstract class TodoAppFragmentContainer<Props = {}, State = {}> extends ReactRelay.FragmentContainer<{ viewer: TodoApp_viewer }, { viewer: TodoApp_viewer_brand }, Props, State> { }
    export type TodoAppRefetchContainerProps<Props, RefetchQuery extends ReactRelay.BaseQuery> = ReactRelay.RefetchContainerProps<{ viewer: TodoApp_viewer }
, Props, RefetchQuery>
    export abstract class TodoAppRefetchContainer<RefetchQuery extends ReactRelay.BaseQuery, Props = {}, State = {}> extends ReactRelay.RefetchContainer<{ viewer: TodoApp_viewer }, { viewer: TodoApp_viewer_brand }, Props, State, RefetchQuery> { }
    export type TodoAppPaginationContainerProps<Props, PaginationQuery extends ReactRelay.BaseQuery> = ReactRelay.PaginationContainerProps<{ viewer: TodoApp_viewer }
, Props, PaginationQuery>
    export abstract class TodoAppPaginationContainer<PaginationQuery extends ReactRelay.BaseQuery, Props = {}, State = {}> extends ReactRelay.PaginationContainer<{ viewer: TodoApp_viewer }, { viewer: TodoApp_viewer_brand }, Props, State, PaginationQuery> { }
  }
}
