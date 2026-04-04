import { Account } from './db';
import { log } from './logger';

export const MOCK_ACCOUNTS = [
	{ _id: '111111111111111111111111', name: 'Superadmin Mock', roles: ['superadmin'], birthdate: new Date('2000-01-01') },
	{ _id: '222222222222222222222222', name: 'Admin Mock', roles: ['admin'], birthdate: new Date('2000-01-01') },
	{ _id: '333333333333333333333333', name: 'Moderator Mock', roles: ['mod'], birthdate: new Date('2000-01-01') },
	{ _id: '444444444444444444444444', name: 'User Mock', roles: [], birthdate: new Date('2000-01-01') }
];

export async function seedMockAccounts() {
	
	if (!require('./config').config.mockLogin) return;

	try {
		for (const mock of MOCK_ACCOUNTS) {
			const existing = await Account.findById(mock._id).exec();
			if (!existing) {
				await Account.create(mock);
				log(`[Mock Login] Seeded account: ${mock.name} (${mock._id})`);
			} else {
				await Account.updateOne({ _id: mock._id }, { $set: mock }).exec();
				log(`[Mock Login] Updated account: ${mock.name} (${mock._id})`);
			}
		}
			
	} catch (err) {
		console.error("[Mock Login] Error seeding mock accounts", err);
	}
}
