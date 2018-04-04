import { connect } from 'react-redux'
import { updateAttention } from '../actions'
import { AttentionView } from '../components/AttentionView'

class AttentionContainer extends Component{
  constructor(props){
    super(props);

    const { dispatch } = props;

    this.boundActionCreators = bindActionCreators([updateAttention], dispatch)
    console.log(this.boundActionCreators);
  }

  componentDidMount(){
    let { dispatch } = this.props;
    dispatch(action)
  }
  render(){
    let { attention } = this.props;
    return <AttentionView attention={attention} {...this.boundActionCreators} />
  }
}

export default AttentionContainer
