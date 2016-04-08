"use strict";
let fs = require('fs');

let expect = require('chai').expect;
let sinon = require('sinon');
require('sinon-as-promised');
let Products = require('../app/products.js');

const path = './test/mock/data/';

describe('Products', function(){
  let readdirStub = sinon.stub(fs, 'readdirSync');
  
  it('lists products', function(){

    let expected = [
      '256731742.json',
      '256731743.json',
      '256731744.json',
    ];

    readdirStub.returns(expected);

    let products = Products(path);

    let list = products.list();

    expect(list).to.deep.equal(expected);
  });
});