"use strict";

let Balance = function(options){

  let podio;
  let id;
  let app_id;
  let balance;
  let fields;

  if (options.podio){
    podio = options.podio;
  } else {
    throw new Error('No podio object set');
  }

  if (options.app_id){
    app_id = options.app_id;
  } else {
    throw new Error('No app_id set');
  }

  if (options.id){
    id = options.id;
  } else {
    throw new Error('No id set');
  }

  if (options.balance || options.balance === 0){
    balance = options.balance;
  } else {
    throw new Error('No balance set');
  }

  if (options.fields){
    fields = options.fields;
  } else {
    throw new Error('No fields set');
  }

  /*
   * Save balance to new balance item in Podio
   */
  let save = () => {
    console.log(`Balance with item_id ${id} will be saved.`);
    let timestamp = new Date().toISOString(),
    start_date = timestamp.substr(0,10),
    start_time = timestamp.substr(11,5);

    let data = {};

    // TODO break out into mapping function
    data[fields.item_number] = id;
    data[fields.balance] = balance;
    data[fields.timestamp] = {
      start_date: start_date,
      start_time: start_time
    };

    podio.request('POST', '/item/app/' + app_id + '/', {
      fields: data
    }).then(function(responseData){
      console.log('item create success');
    }, function(e){
      console.error('Error:', e.body.error);
      console.error('Error description:', e.description);
      console.error('HTTP status:', e.status);
      console.error('Requested URL:', e.url);
    });
  };

  return {
    save
  };
};

module.exports = Balance;
