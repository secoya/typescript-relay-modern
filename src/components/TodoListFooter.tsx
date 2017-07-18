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

import RemoveCompletedTodosMutation from '../mutations/RemoveCompletedTodosMutation';

import * as React from 'react';
import {
	createFragmentContainer,
	graphql,
} from 'react-relay';

class TodoListFooter extends Relay.TodoListFooterFragmentContainer {
	private handleRemoveCompletedTodosClick = () => {
		RemoveCompletedTodosMutation.commit(
			this.props.relay.environment,
			this.props.viewer.completedTodos,
			this.props.viewer,
		);
	}

	public render() {
		const numCompletedTodos = this.props.viewer.completedCount;
		const numRemainingTodos = this.props.viewer.totalCount - numCompletedTodos;

		const clearCompleted = numCompletedTodos > 0 && (
			<button
				className="clear-completed"
				onClick={this.handleRemoveCompletedTodosClick}>
				Clear completed
			</button>
		);
		return (
			<footer className="footer">
				<span className="todo-count">
					<strong>{numRemainingTodos}</strong> item{numRemainingTodos === 1 ? '' : 's'} left
				</span>
				{clearCompleted}
			</footer>
		);
	}
}

export default createFragmentContainer(
	TodoListFooter,
	graphql`
		fragment TodoListFooter_viewer on User {
			id,
			completedCount,
			completedTodos: todos(
				status: "completed",
				first: 2147483647  # max GraphQLInt
			) {
				edges {
					node {
						id
						complete
					}
				}
			},
			totalCount,
		}
	`,
);
