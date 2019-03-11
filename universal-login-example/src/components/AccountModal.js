


import React, { Component }from 'react'
import Account from './Account';
import { Button, Header, Image, Modal} from 'semantic-ui-react'

class AccountModal extends Component { 

    render() {
        let open = this.props.open;
        let close = this.props.close;
        let identityService = this.props.identityService;
        return (
            <Modal open={open} onClose={close} className="">
                <Modal.Content>
                    <Account identityService={identityService} close={close}/>
                </Modal.Content>
            </Modal>
        )
    }
}

export default AccountModal