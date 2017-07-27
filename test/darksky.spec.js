'use strict'

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var sinon = require('sinon');
var DarkSky = require('../lib/darkskyjs');

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomNumbers(length) {
    var numArray = [];
    for (var i = 0; i < length; i++) {
        numArray[i] = getRandomInt(1, 10000);
    }
    return numArray;
}

// Calculator module suite
// Group specs with describe
// Use as many specs as you like
describe('Test the methods of DarkSky', function() {
    before(function() {
        this.darkSky = new DarkSky({API_KEY: 'xxxyyy', PROXY_SCRIPT: 'http://testsite.com'});
    });
    // executes once, before all tests
    beforeEach(function() {
        this.randomPosLatitude = getRandomInt(0, 90);
        this.randomPosLongitude = getRandomInt(0, 180);
        this.randomNegLatitude = -Math.abs(getRandomInt(0, 90));
        this.randomNegLongitiude = -Math.abs(getRandomInt(0, 180));
        // stubs
        this.xhr = sinon.useFakeXMLHttpRequest();
        this.xhr.response = {};
        this.makeRequestStub = sinon.stub(this.darkSky, 'makeRequest');
    });

    afterEach(function() {
        this.makeRequestStub.restore();
        this.xhr.restore();
    });

    //create scale spec
    it('getURL should return a string', function() {
        expect(this.darkSky.getURL(this.randomPosLatitude, this.randomNegLongitiude)).to.be.a('string');
    });
    it('makeRequest should return an object', function() {
        var makeRequestStubSuccess = this.makeRequestStub.returns(Promise.resolve(this.xhr.response));
        expect(makeRequestStubSuccess()).to.eventually.be.an('object');
    });
    it('makeReuest should return an object as a response', function() {
        var makeRequestStubSuccess = this.makeRequestStub.returns(Promise.resolve(this.xhr.response));
        return makeRequestStubSuccess().then((response) => {
            expect(response).to.be.an('object');
        });
    });
    it('makeRequest should return an error', function() {
        var makeRequestStubFail = this.makeRequestStub.returns(Promise.reject('error'));
        return makeRequestStubFail().catch((e) => {
            expect(e).to.equal('error');
        });
    });
});
