pragma solidity ^0.5.2;


contract FXPoints {
    uint public lastPressed;
    event ButtonPress(address presser, uint pressTime, uint score);

    mapping (address=>uint) memberTokens_;
    event PointsAwarded(address memeber, uint pressTime, uint score);

    // Set up last pressed at deploy
    constructor() public {
        // lastPressed = now;
    }

    function spend(uint256 _amount) public {
        // issue the tokens to the player
        address member = msg.sender;
        memberTokens_[member] += _amount;
    }

    function balanceOf(address _member) 
        public view
        returns (uint256)
    {
        return memberTokens_[_member];
    }
}
