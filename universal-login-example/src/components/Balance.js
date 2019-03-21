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
        locked,
        to,
        gasPrice,
        onChangeGasPrice,
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
                                Amount: <Input type='number' onChange={onChangeAmount} value={amount} step={0.1} min={0} disabled={locked} />
                            </span>
                        </div>
                        <div style={{marginTop:'16px'}}>
                            <Input style={{ width: '340px' }} placeholder="发送地址" type='text' onChange={onChangeTo} value={to}  disabled={locked} />
                        </div>
                        <div style={{marginTop:'16px'}}>
                            <p>Gas price (Gwei):</p>
                            <div>
                                <Input type='range' min={0.5} max={100} step={0.1} value={gasPrice} onChange={onChangeGasPrice} />
                                <Input type='number' min={0.5} max={100} step={0.1} value={gasPrice} onChange={onChangeGasPrice} style={{marginLeft:'16px'}} />
                            </div>
                        </div>
                        <Button style={{marginTop:'16px'}} color='blue' onClick={onConfirmSendTransaction} disabled={locked} >
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
