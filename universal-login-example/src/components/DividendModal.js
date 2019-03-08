
import React, { Component }from 'react'
import { Button, Header, Image, Modal, Grid } from 'semantic-ui-react'

class DividendModal extends Component { 

    render() {
        let open = this.props.open;
        let close = this.props.close;

        return (
            <Modal open={open} onClose={close} className="help_modal">
                <Modal.Header style={{textAlign:'center'}}>
                {/* <img help_title */}
                </Modal.Header>
                <Modal.Content>
                2345
                </Modal.Content>
            </Modal>
        )
    }
}

export default DividendModal