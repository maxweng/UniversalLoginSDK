
import React, { Component }from 'react'
import { Button, Header, Image, Modal, Grid, List } from 'semantic-ui-react'

class DividendModal extends Component { 

    render() {
        let open = this.props.open;
        let close = this.props.close;

        return (
            <Modal open={open} onClose={close} className="help_modal">
                <Modal.Header style={{textAlign:'center'}}>
                    <img className="title" src={require('../img/help_title.png')} />
                    <img className="close_btn" onClick={close} src={require('../img/close_btn.png')} />
                {/* <img help_title */}
                </Modal.Header>
                <Modal.Content>
                    <List>
                        Q:rwfewlf,erf,erf,<br/>
                        A:ferwferferferf
                    </List>
                    <List>
                        Q:rwfewlf,erf,erf,<br/>
                        A:ferwferferferf
                    </List>
                    <List>
                        Q:rwfewlf,erf,erf,<br/>
                        A:ferwferferferf
                    </List>
                    <List>
                        Q:rwfewlf,erf,erf,<br/>
                        A:ferwferferferf
                    </List>
                </Modal.Content>
            </Modal>
        )
    }
}

export default DividendModal