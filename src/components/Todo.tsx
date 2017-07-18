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

import ChangeTodoStatusMutation from '../mutations/ChangeTodoStatusMutation';
import RemoveTodoMutation from '../mutations/RemoveTodoMutation';
import RenameTodoMutation from '../mutations/RenameTodoMutation';
import TodoTextInput from './TodoTextInput';

import * as classnames from 'classnames';
import * as React from 'react';
import {
	createFragmentContainer,
	graphql,
} from 'react-relay';

interface Props { }

interface State {
	isEditing: boolean;
}

class Todo extends Relay.TodoFragmentContainer<Props, State> {
	public constructor(props: Relay.TodoFragmentContainerProps<Props>) {
		super(props);
		this.state = {
			isEditing: false,
		};
	}
	private handleCompleteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const complete = e.target.checked;
		ChangeTodoStatusMutation.commit(
			this.props.relay.environment,
			complete,
			this.props.todo,
			this.props.viewer,
		);
	}

	private handleDestroyClick = () => {
		this.removeTodo();
	}

	private handleLabelDoubleClick = () => {
		this.setEditMode(true);
	}

	private handleTextInputCancel = () => {
		this.setEditMode(false);
	}

	private handleTextInputDelete = () => {
		this.setEditMode(false);
		this.removeTodo();
	}

	private handleTextInputSave = (text: string) => {
		this.setEditMode(false);
		RenameTodoMutation.commit(
			this.props.relay.environment,
			text,
			this.props.todo,
		);
	}

	private removeTodo() {
		RemoveTodoMutation.commit(
			this.props.relay.environment,
			this.props.todo,
			this.props.viewer,
		);
	}

	private renderTextInput() {
		return (
			<TodoTextInput
				autoFocus={true}
				className="edit"
				commitOnBlur={true}
				initialValue={this.props.todo.text}
				onCancel={this.handleTextInputCancel}
				onDelete={this.handleTextInputDelete}
				onSave={this.handleTextInputSave}
			/>
		);
	}

	private setEditMode = (shouldEdit: boolean) => {
		this.setState({ isEditing: shouldEdit });
	}

	public render() {
		const className = classnames({
			completed: this.props.todo.complete,
			editing: this.state.isEditing,
		});
		return (
			<li
				className={className}>
				<div className="view">
					<input
						checked={this.props.todo.complete || false}
						className="toggle"
						onChange={this.handleCompleteChange}
						type="checkbox"
					/>
					<label onDoubleClick={this.handleLabelDoubleClick}>
						{this.props.todo.text}
					</label>
					<button
						className="destroy"
						onClick={this.handleDestroyClick}
					/>
				</div>
				{this.state.isEditing && this.renderTextInput()}
			</li>
		);
	}
}

export default createFragmentContainer(Todo, {
	todo: graphql`
	fragment Todo_todo on Todo {
		complete
		id
		text
	}
  `,
	viewer: graphql`
	fragment Todo_viewer on User {
		id
		totalCount
		completedCount
	}
  `,
});
