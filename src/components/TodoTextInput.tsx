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

import * as React from 'react';
import * as ReactDOM from 'react-dom';

const ENTER_KEY_CODE = 13;
const ESC_KEY_CODE = 27;

interface Props {
	autoFocus: boolean;
	className: string;
	commitOnBlur?: boolean;
	initialValue: string | null;
	placeholder?: string;
	onCancel?(): void;
	onDelete?(): void;
	onSave(newText: string): void;
}

interface State {
	isEditing: boolean;
	text: string;
}

export default class TodoTextInput extends React.Component<Props, State> {
	public static defaultProps = {
		commitOnBlur: false,
	};
	public constructor(props: Props) {
		super(props);
		this.state = {
			isEditing: false,
			text: this.props.initialValue || '',
		};
	}
	public componentDidMount() {
		if (this.props.autoFocus) {
			(ReactDOM.findDOMNode(this) as HTMLInputElement).focus();
		}
	}
	private commitChanges = () => {
		const newText = this.state.text.trim();
		if (this.props.onDelete && newText === '') {
			this.props.onDelete();
		} else if (this.props.onCancel && newText === this.props.initialValue) {
			this.props.onCancel();
		} else if (newText !== '') {
			this.props.onSave(newText);
			this.setState({ text: '' });
		}
	}

	private handleBlur = () => {
		if (this.props.commitOnBlur) {
			this.commitChanges();
		}
	}

	private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.setState({ text: e.target.value });
	}

	private handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (this.props.onCancel && e.keyCode === ESC_KEY_CODE) {
			this.props.onCancel();
		} else if (e.keyCode === ENTER_KEY_CODE) {
			this.commitChanges();
		}
	}

	public render() {
		return (
			<input
				className={this.props.className}
				onBlur={this.handleBlur}
				onChange={this.handleChange}
				onKeyDown={this.handleKeyDown}
				placeholder={this.props.placeholder}
				value={this.state.text}
			/>
		);
	}
}
