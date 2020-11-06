const { expectRevert } = require('@openzeppelin/test-helpers');
const SexToken = artifacts.require('SexToken');

contract('SexToken', ([alice, bob, carol]) => {
    beforeEach(async () => {
        this.Sex = await SexToken.new({ from: alice });
    });

    it('should have correct name and symbol and decimal', async () => {
        const name = await this.Sex.name();
        const symbol = await this.Sex.symbol();
        const decimals = await this.Sex.decimals();
        assert.equal(name.valueOf(), 'SexToken');
        assert.equal(symbol.valueOf(), 'Sex');
        assert.equal(decimals.valueOf(), '18');
    });

    it('should only allow owner to mint token', async () => {
        await this.Sex.mint(alice, '100', { from: alice });
        await this.Sex.mint(bob, '1000', { from: alice });
        await expectRevert(
            this.Sex.mint(carol, '1000', { from: bob }),
            'Ownable: caller is not the owner',
        );
        const totalSupply = await this.Sex.totalSupply();
        const aliceBal = await this.Sex.balanceOf(alice);
        const bobBal = await this.Sex.balanceOf(bob);
        const carolBal = await this.Sex.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '100');
        assert.equal(bobBal.valueOf(), '1000');
        assert.equal(carolBal.valueOf(), '0');
    });

    it('should supply token transfers properly', async () => {
        await this.Sex.mint(alice, '100', { from: alice });
        await this.Sex.mint(bob, '1000', { from: alice });
        await this.Sex.transfer(carol, '10', { from: alice });
        await this.Sex.transfer(carol, '100', { from: bob });
        const totalSupply = await this.Sex.totalSupply();
        const aliceBal = await this.Sex.balanceOf(alice);
        const bobBal = await this.Sex.balanceOf(bob);
        const carolBal = await this.Sex.balanceOf(carol);
        assert.equal(totalSupply.valueOf(), '1100');
        assert.equal(aliceBal.valueOf(), '90');
        assert.equal(bobBal.valueOf(), '900');
        assert.equal(carolBal.valueOf(), '110');
    });

    it('should fail if you try to do bad transfers', async () => {
        await this.Sex.mint(alice, '100', { from: alice });
        await expectRevert(
            this.Sex.transfer(carol, '110', { from: alice }),
            'ERC20: transfer amount exceeds balance',
        );
        await expectRevert(
            this.Sex.transfer(carol, '1', { from: bob }),
            'ERC20: transfer amount exceeds balance',
        );
    });
  });
