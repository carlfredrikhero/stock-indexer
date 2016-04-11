'use strict';
let fs = require('fs');

let expect = require('chai').expect;
let sinon = require('sinon');
require('sinon-as-promised');
let Products = require('../app/products.js');

const path = './test/mock/data/';

describe('Products', function(){
  let readdirStub = sinon.stub(fs, 'readdirSync');
  let statSyncStub = sinon.stub(fs, 'statSync');
  //fs.statSync(file).isFile()

  it('lists products', function(){

    let files = [
      '256731742.json',
      '256731743.json',
      '256731744.json',
    ];

    let expected = files.map(file => path + file);

    readdirStub.returns(files);
    statSyncStub.returns({
      isFile: function() {
        return true;
      }
    });

    let products = Products({path});

    let list = products.list();

    expect(list).to.deep.equal(expected);
  });
});
