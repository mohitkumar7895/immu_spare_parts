const mysql = require('mysql2/promise');

async function seedData() {
  const connection = await mysql.createConnection('mysql://root@localhost:3306/imran_spare_parts');
  console.log('Connected. Seeding dummy data...');

  try {
    // Seed Parts
    await connection.query(`
      INSERT IGNORE INTO parts (id, part_number, part_name, vehicle_name, company_name, purchase_price, selling_price, secret_cost, opening_stock, current_stock, minimum_stock)
      VALUES 
      ('prt_1', 'BRK-1025', 'Brake Pad', 'Tata Ace', 'Tata Motors', 850.00, 1100.00, 700.00, 10, 10, 2),
      ('prt_2', 'OIL-202', 'Oil Filter', 'Bolero', 'Mahindra', 300.00, 500.00, 250.00, 15, 15, 5),
      ('prt_3', 'AIR-305', 'Air Filter', 'Swift', 'Maruti Suzuki', 400.00, 700.00, 350.00, 8, 8, 3),
      ('prt_4', 'CLU-410', 'Clutch Plate', 'WagonR', 'Maruti Suzuki', 1200.00, 1800.00, 1000.00, 5, 5, 2),
      ('prt_5', 'HDL-550', 'Headlight', 'Scorpio', 'Mahindra', 2500.00, 3200.00, 2100.00, 4, 4, 2)
    `);
    console.log('Parts seeded');

    // Seed Customers
    await connection.query(`
      INSERT IGNORE INTO customers (id, name, mobile, location)
      VALUES 
      ('cus_1', 'Rahul Kumar', '9876543210', 'New Delhi'),
      ('cus_2', 'Amit Singh', '9123456780', 'Noida')
    `);
    console.log('Customers seeded');

    // Seed Vehicles
    await connection.query(`
      INSERT IGNORE INTO vehicles (id, vehicle_number, vehicle_name, customer_id, model, company)
      VALUES 
      ('veh_1', 'UP80AB1234', 'Tata Ace', 'cus_1', 'Gold', 'Tata Motors'),
      ('veh_2', 'DL4CAB5678', 'Swift', 'cus_2', 'VXI', 'Maruti Suzuki')
    `);
    console.log('Vehicles seeded');
    console.log('Dummy data successfully added to SQL!');
  } catch (error) {
    console.error('Failed to insert dummy data:', error);
  } finally {
    await connection.end();
  }
}

seedData().catch(console.error);
