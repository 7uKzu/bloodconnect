import { InventoryUnit } from '../models/index.js';
import { Sequelize } from 'sequelize';

/**
 * CREATE inventory units
 * One row = one unit
 */
export async function create(req, res) {
  try {
    const { blood_group, location, quantity } = req.body;

    if (!blood_group || !quantity) {
      return res
        .status(400)
        .json({ message: 'blood_group and quantity are required' });
    }

    const count = Number(quantity);
    if (Number.isNaN(count) || count <= 0) {
      return res
        .status(400)
        .json({ message: 'quantity must be a positive number' });
    }

    const units = [];
    for (let i = 0; i < count; i++) {
      units.push({
        blood_group,
        location: location || null,
        status: 'available',
      });
    }

    await InventoryUnit.bulkCreate(units);

    return res
      .status(201)
      .json({ message: 'Inventory added successfully' });
  } catch (error) {
    console.error('Create inventory error:', error);
    return res
      .status(500)
      .json({ message: 'Failed to add inventory' });
  }
}

/**
 * LIST inventory (AGGREGATED)
 * Returns blood_group + units count
 */
export async function list(req, res) {
  try {
    const inventory = await InventoryUnit.findAll({
      attributes: [
        'blood_group',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'units'],
      ],
      where: {
        status: 'available',
      },
      group: ['blood_group'],
      order: [['blood_group', 'ASC']],
    });

    return res.json(inventory);
  } catch (error) {
    console.error('List inventory error:', error);
    return res
      .status(500)
      .json({ message: 'Failed to fetch inventory' });
  }
}
