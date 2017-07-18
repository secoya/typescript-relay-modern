/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import MarkAllTodosMutation from '../mutations/MarkAllTodosMutation';
import Todo from './Todo';

import * as React from 'react';
import {
	createFragmentContainer,
	graphql,
} from 'react-relay';

class TodoList extends Relay.TodoListFragmentContainer {
	private handleMarkAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const complete = e.target.checked;
		MarkAllTodosMutation.commit(
			this.props.relay.environment,
			complete,
			this.props.viewer.todos,
			this.props.viewer,
		);
	}

	private renderTodos() {
		const todos: JSX.Element[] = [];
		if (this.props.viewer.todos.edges != null) {
			this.props.viewer.todos.edges.forEach(edge => {
				if (edge != null && edge.node != null) {
					const todo = (
						<Todo
							key={edge.node.id}
							todo={edge.node}
							viewer={this.props.viewer}
						/>
					);
					todos.push(todo);
				}
			});
		}
		return todos;
	}

	public render() {
		const numTodos = this.props.viewer.totalCount;
		const numCompletedTodos = this.props.viewer.completedCount;
		return (
			<section className="main">
				<input
					checked={numTodos === numCompletedTodos}
					className="toggle-all"
					onChange={this.handleMarkAllChange}
					type="checkbox"
				/>
				<label htmlFor="toggle-all">
					Mark all as complete
				</label>
				<ul className="todo-list">
					{this.renderTodos()}
				</ul>
			</section>
		);
	}
}

export default createFragmentContainer(TodoList, {
	viewer: graphql`
		fragment TodoList_viewer on User {
			todos(
			first: 2147483647  # max GraphQLInt
			) @connection(key: "TodoList_todos") {
			edges {
				node {
				id,
				complete,
				...Todo_todo,
				},
			},
			},
			id,
			totalCount,
			completedCount,
			...Todo_viewer,
		}
	`,
});
