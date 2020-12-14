const Staking = artifacts.require("SexStaking");
const Token = artifacts.require("DappToken");
const increaseTime = require("./utils/increaseTime.js").increaseTime;
const latestTime = require("./utils/latestTime.js").latestTime;
const assertRevert = require("./utils/assertRevert.js").assertRevert;

contract("Scenario based calculations for staking model", ([S1, S2, S3, S4, S5, S6]) => {
    
    it("1. staking revert if user try to stake the amount without giving approval to staking contract.", async () => {
      let StakingInstance = await Staking.deployed();
      await assertRevert(StakingInstance.stake("2000000000000000000"));
    });

    it("2. staking revert if user try to stake less than the minimum amount of staking.", async () => {
      let StakingInstance = await Staking.deployed();
      let tokenInstance = await Token.deployed();
      await tokenInstance.approve(StakingInstance.address,"5000000000000000000")
      await assertRevert(StakingInstance.stake("1000"));
    });

     it("3. user can stake if each and every conditions satisfied according to the contract.", async () => {
      let StakingInstance = await Staking.deployed();
      let tokenInstance = await Token.deployed();
      await tokenInstance.approve(StakingInstance.address,"5000000000000000000")
      await StakingInstance.stake("2000000000000000000");
    });

 it("4. user will not stake again if he already staked.", async () => {
      let StakingInstance = await Staking.deployed();
      let tokenInstance = await Token.deployed();
      await tokenInstance.approve(StakingInstance.address,"5000000000000000000")
      await assertRevert(StakingInstance.stake("2000000000000000000"));
    });

 it("5. 5% of staked amount will be deducted from the staked amount.", async () => {
      let StakingInstance = await Staking.deployed();
      let tokenInstance = await Token.deployed();
      await tokenInstance.transfer(S4,"2000000000000000000")
      let stakedAmount_beforeStaking = await StakingInstance.stakedAmount(S4);
      await tokenInstance.approve(StakingInstance.address,"5000000000000000000",{from :S4})
      await StakingInstance.stake("2000000000000000000",{from :S4});
      let stakedAmount_afterStaking = await StakingInstance.stakedAmount(S4);
      assert.equal(parseFloat(stakedAmount_afterStaking)-parseFloat(stakedAmount_beforeStaking),2000000000000000000 - ((5*2000000000000000000)/100));
    });

 it("6. 2% of staked amount will goes into the admin's wallet.", async () => {
      let StakingInstance = await Staking.deployed();
      let tokenInstance = await Token.deployed();
      await tokenInstance.transfer(S3,"2000000000000000000")
      let adminBalance_beforeStaking = await tokenInstance.balanceOf(S2);
      await tokenInstance.approve(StakingInstance.address,"5000000000000000000",{from :S3})
      await StakingInstance.stake("2000000000000000000",{from :S3});
      let adminBalance_afterStaking = await tokenInstance.balanceOf(S2);
      assert.equal(parseFloat(adminBalance_afterStaking)-parseFloat(adminBalance_beforeStaking),(2*2000000000000000000)/100);
    });

 it("7. 10% will be charged if Unstake before 28 days.", async () => {
       let StakingInstance = await Staking.deployed();
      let tokenInstance = await Token.deployed();
      let balance_beforeStaking = await tokenInstance.balanceOf(S3);
      let stakedAmount_beforeStaking = await StakingInstance.stakedAmount(S3);
      await StakingInstance.unStake({from :S3});
      let balance_afterStaking = await tokenInstance.balanceOf(S3);
      let stakedAmount_afterStaking = await StakingInstance.stakedAmount(S3);
      assert.equal(parseFloat(balance_afterStaking)-parseFloat(balance_beforeStaking),parseFloat(stakedAmount_beforeStaking)-(10*parseFloat(stakedAmount_beforeStaking))/100);
    });

it("8. 5% will be charged if Unstake before 56 days.", async () => {
       let StakingInstance = await Staking.deployed();
      let tokenInstance = await Token.deployed();
      let balance_beforeStaking = await tokenInstance.balanceOf(S4);
      let stakedAmount_beforeStaking = await StakingInstance.stakedAmount(S4);
      await increaseTime(29*86400);
      let totalReward = ((parseFloat(stakedAmount_beforeStaking)*100)/10000)*(29-28)
      totalReward = totalReward+(((parseFloat(stakedAmount_beforeStaking)*50)/10000)*28)
      await StakingInstance.unStake({from :S4});
      let balance_afterStaking = await tokenInstance.balanceOf(S4);
      let stakedAmount_afterStaking = await StakingInstance.stakedAmount(S4);
      assert.equal(Math.round(parseFloat(balance_afterStaking)/1e18-parseFloat(balance_beforeStaking)/1e18),Math.round(parseFloat(stakedAmount_beforeStaking)/1e18+(totalReward - ((5*parseFloat(stakedAmount_beforeStaking))/100))/1e18));
    });

it("9. 2.5% will be charged if Unstake before 84 days.", async () => {
       let StakingInstance = await Staking.deployed();
      let tokenInstance = await Token.deployed();

      await tokenInstance.transfer(S5,"2000000000000000000")
      await tokenInstance.approve(StakingInstance.address,"5000000000000000000",{from :S5})
      await StakingInstance.stake("2000000000000000000",{from :S5});

      let balance_beforeStaking = await tokenInstance.balanceOf(S5);
      let stakedAmount_beforeStaking = await StakingInstance.stakedAmount(S5);
      await increaseTime(65*86400);
      let totalReward = ((parseFloat(stakedAmount_beforeStaking)*100)/10000)*(65-28)
      totalReward = totalReward+(((parseFloat(stakedAmount_beforeStaking)*50)/10000)*28)
      await StakingInstance.unStake({from :S5});
      let balance_afterStaking = await tokenInstance.balanceOf(S5);
      let stakedAmount_afterStaking = await StakingInstance.stakedAmount(S5);
      assert.equal(Math.round(parseFloat(balance_afterStaking)/1e18-parseFloat(balance_beforeStaking)/1e18),Math.round(parseFloat(stakedAmount_beforeStaking)/1e18+(totalReward - ((2.5*parseFloat(stakedAmount_beforeStaking))/100))/1e18));
    });

it("10. 0% will be charged if Unstake after 84 days.", async () => {
       let StakingInstance = await Staking.deployed();
      let tokenInstance = await Token.deployed();

      await tokenInstance.transfer(S6,"2000000000000000000")
      await tokenInstance.approve(StakingInstance.address,"5000000000000000000",{from :S6})
      await StakingInstance.stake("2000000000000000000",{from :S6});

      let balance_beforeStaking = await tokenInstance.balanceOf(S6);
      let stakedAmount_beforeStaking = await StakingInstance.stakedAmount(S6);
      await increaseTime(85*86400);
      let totalReward = (stakedAmount_beforeStaking*100/10000)*(85-28)
      totalReward = totalReward+((stakedAmount_beforeStaking*50/10000)*28)
      await StakingInstance.unStake({from :S6});
      let balance_afterStaking = await tokenInstance.balanceOf(S6);
      let stakedAmount_afterStaking = await StakingInstance.stakedAmount(S6);
      assert.equal(Math.round(parseFloat(balance_afterStaking)/1e18-parseFloat(balance_beforeStaking)/1e18),Math.round(parseFloat(stakedAmount_beforeStaking)/1e18+(totalReward)/1e18));
    });
});