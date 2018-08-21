const pg = require('pg');



    var connection =  {
      host: '',
      user: '',
      password: '',
      database: '',
      port: ''
    }



async function test() {
    const client = new pg.Client(connection);
    try {
        
        client.connect();
        var query = 'select a.* from transaction_citytype a , transaction_citytype b where a.name = b.name and a.id <> b.id and a.state_id in (2,21) order by a.name, a.state_id desc ;'
        const res = await client.query(query)
        rows = res.rows
        // console.log(rows)
        // await client.end()
        // return
        for (var i = 0; i < res.rows.length; i++) {
            var badId
            var goodId
            if (rows[i].name != rows[i + 1].name) {
                continue
            }
            if (rows[i].state_id == 21) {
                badId = rows[i].id
            }
            if (rows[i + 1].state_id == 2) {
                goodId = rows[i + 1].id
            }
            console.log('badId=', badId)
            console.log('goodId=', goodId)
            try {
                query = `update transaction_citytype_mappings set from_citytype_id = ${goodId} where from_citytype_id = ${badId}`
                await client.query(query)
                console.log('mapping done1')
            } catch{ console.log('mapping not done1')}
            
            try {
                query = `update transaction_citytype_mappings set to_citytype_id = ${goodId} where to_citytype_id = ${badId}`
                await client.query(query)
                console.log('mapping done2')
            }
            catch{console.log('mapping not done2') }
            
            query = `update transaction_transaction set city_type_id = ${goodId} where city_type_id = ${badId}`
            await client.query(query)
            console.log('update done')

            try {
                query = `delete from transaction_citytype_mappings where from_citytype_id = ${badId}`
                console.log(query)
                await client.query(query)
                console.log('delete done1')
            } catch (e) {
                console.log('delete not to: ' , e)
            }
            
            try {
                query = `delete from transaction_citytype_mappings where to_citytype_id = ${badId}`
                await client.query(query)
                console.log('delete to')
            } catch (e) {
                console.log('delete not to: ' , e)
            }

            query = `delete from transaction_citytype where id = ${badId}`
            await client.query(query)
            console.log('delete done')
        }

        await client.end()
    }
    catch (e) {
        console.log(e)
        await client.end()
    }
}

test()