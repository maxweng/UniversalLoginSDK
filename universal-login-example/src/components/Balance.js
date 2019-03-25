import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { Button, Input, Transition } from 'semantic-ui-react'
class Balance extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: false };
  }

  show() {
    this.setState({ visible: true })
  }

  hide() {
    this.setState({ visible: false })
  }

  render() {
    const { visible } = this.state
    const { 
        balance,
        amount,
        to,
        loading,
        onChangeAmount,
        onChangeTo,
        onConfirmSendTransaction,
    } = this.props

    return (
      <div style={{textAlign: 'center'}}>
            <div style={{display:visible?'none':'block'}}>
                <Transition visible={!visible} animation='fade right' duration={{ hide: 0, show: 500 }}>
                    <div>
                        <h4> {balance} ETH</h4>
                        <Button color='blue' fluid style={{marginTop: '40px'}} onClick={this.show.bind(this)}>
                            发送
                        </Button>
                    </div>
                </Transition>
            </div>
            <div style={{display:visible?'block':'none'}}>
                <Transition visible={visible} animation='fade left' duration={{ hide: 0, show: 500 }}>
                    <div>
                        <div style={{marginTop:'16px'}}>
                            <span>
                                金额: <Input type='number' onChange={onChangeAmount} value={amount} step={0.1} min={0} />
                            </span>
                        </div>
                        <div style={{marginTop:'16px'}}>
                            <Input style={{ width: '340px' }} placeholder="发送地址" type='text' onChange={onChangeTo} value={to} />
                        </div>
                        <Button style={{marginTop:'16px'}} color='blue' loading={loading} onClick={onConfirmSendTransaction.bind(this)} >
                            发送交易
                        </Button>
                        <Button style={{marginTop:'16px'}} basic onClick={this.hide.bind(this)}>
                            关闭
                        </Button>   
                    </div>  
                </Transition>
            </div>
      </div>
    );
  }
}
Balance.propTypes = {
  identityService: PropTypes.object
};

export default Balance;
