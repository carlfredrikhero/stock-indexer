'use strict';
let fs = require('fs');

let expect = require('chai').expect;
let sinon = require('sinon');
require('sinon-as-promised');
let Product = require('../app/product.js');

const path = './test/mock/data/';

describe('Product', function(){

    describe('Make sure isNode is set to true', function(){
      it('Checks the const isNode equals true', function(){
        let product = Product({path});

        expect(product.isNode).to.be.true;
      });
    });

    describe('Missing required options', function(){
        it('Throws Error if path is missing from options', function(){
            expect(function(){
                let product = Product({});
            }).to.throw('No path or filepath set');
        });
    });

    describe('Read from file', function(){
      it('Read the content of a file and makes it available with Product.to_object', sinon.test(function(){
        let expected = {
          "item_id": 123,
          "item_number": 123,
          "balance": 123
        };

        let readFileStub = sinon.stub(fs, 'readFileSync');
        readFileStub.returns(JSON.stringify(expected));

        let podio = {};
        let product = Product({
          path,
          podio,
          item_id: 123
        });

        product.read();

        expect(product.to_object()).to.deep.equal(expected);
      }));
    });

    describe('Set value', function(){
      it('sets a value which is expected to be included in to_object', function(){
        let product = Product({path});
        product.set('item_id', 123);

        expect(product.to_object()).to.have.property('item_id', 123);
      });
    });

    describe('Write to file', function(){
      let podio = {};
      let product = Product({
        path,
        podio,
        item_id: 123,
        item_number: 456789,
        balance: 100
      });

      let writeFileStub = sinon.stub(fs, 'writeFileSync');

      it('writes the data in to_object() to a file as a JSON string', sinon.test(function(){
          writeFileStub.returns(undefined);

          // return a 'empty' promise ('then' does not return all value)
          return product.write();
      }));

      it('fails to write to file', sinon.test(function(){
          writeFileStub.throws();

          return product.write().catch(function(error){
            expect(error).to.be.instanceOf(Error);
          });
      }));
    });

    describe('Fetch from Podio', function(){
      let podio = {
        request: function(){}
      };

      let podioRequest = sinon.stub(podio, 'request');
      let product = Product({
        path,
        podio,
        item_id: 123,
        fields: {
        item_number: 111827783
      }
      });

      it('fetches the item_number of item_id from Podio and assigns it to the local variable item_number, balance is set to 0', function(){
        let expected = {
          item_id: 123,
          item_number: 123456,
          balance: 0
        };

        podioRequest.resolves({values: 123456});

        return product.fetch()
        .then(function(){
          expect(product.to_object()).deep.equal(expected);
        });
      });
    });
});
