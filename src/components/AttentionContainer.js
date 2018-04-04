import { connect } from 'react-redux'
import { updateAttention } from '../actions'
import { AttentionView } from '../components/AttentionView'

class AttentionContainer extends Component{
  render(){
    let { attention } = this.props;
    return <AttentionView attention={attention} {...this.boundActionCreators} />
  }
}

export default AttentionContainer
