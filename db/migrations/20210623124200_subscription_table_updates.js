exports.up = function (knex) {
	return knex('subscriptions')
		.insert([
			{
				subscription_code: 'V_MOD',
				subscription_name: 'Vendor_Moderate',
				price: '50',
				status: 'ACTIVE',
				description: 'Vendor Moderate Package',
				subscription_type: 'package',
				comission_to_pay_percentage: '5',
				can_sell_food_directly_to_guests: 'TRUE',
				can_sell_food_experiences_to_guests: 'TRUE',
				validity_in_months: '1',
				fesitval_limit: '1',
			},
			{
				subscription_code: 'V_ULTRA',
				subscription_name: 'Vendor_Ultra',
				price: '150',
				status: 'ACTIVE',
				description: 'Vendor Ultra Package',
				subscription_type: 'package',
				comission_to_pay_percentage: '5',
				can_sell_food_directly_to_guests: 'TRUE',
				can_sell_food_experiences_to_guests: 'TRUE',
				validity_in_months: '12',
				fesitval_limit: '4',
			},
			{
				subscription_code: 'KV_MOD',
				subscription_name: 'Kodidi_Vendor_Moderate',
				price: '50',
				status: 'ACTIVE',
				description: 'Kodidi Vendor Moderate Package',
				subscription_type: 'package',
				comission_to_pay_percentage: '5',
				can_sell_food_directly_to_guests: 'TRUE',
				can_sell_food_experiences_to_guests: 'TRUE',
				validity_in_months: '12',
			},
			{
				subscription_code: 'KV_ULTRA',
				subscription_name: 'Kodidi_Vendor_Ultra',
				price: '500',
				status: 'ACTIVE',
				description: 'Kodidi Vendor Ultra Package',
				subscription_type: 'package',
				comission_to_pay_percentage: '5',
				can_sell_food_directly_to_guests: 'TRUE',
				can_sell_food_experiences_to_guests: 'TRUE',
				validity_in_months: '12',
			},
			{
				subscription_code: 'G_MSHIP2',
				subscription_name: 'Gues_Membership_2',
				price: '25',
				status: 'ACTIVE',
				description: 'Guest Membership level 2',
				subscription_type: 'package',
				validity_in_months: '1',
				fesitval_limit: '1',
				// comission_to_pay_percentage: "20",
				// payment_receivable_per_food_sample: "2",
				// can_sell_food_directly_to_guests: "TRUE",
				// can_sell_food_experiences_to_guests: "FALSE"
			},
			{
				subscription_code: 'G_MSHIP3',
				subscription_name: 'Gues_Membership_3',
				price: '80',
				status: 'ACTIVE',
				description: 'Guest Membership level 3',
				subscription_type: 'package',
				validity_in_months: '12',
				fesitval_limit: '4',
				// comission_to_pay_percentage: "20",
				// payment_receivable_per_food_sample: "2",
				// can_sell_food_directly_to_guests: "TRUE",
				// can_sell_food_experiences_to_guests: "FALSE"
			},
			{
				subscription_code: 'KG_MSHIP2',
				subscription_name: 'Kodidi_Gues_Membership_2',
				price: '10',
				status: 'ACTIVE',
				description: 'Kodidi Guest Membership level 2',
				subscription_type: 'package',
				validity_in_months: '12',
				// comission_to_pay_percentage: "20",
				// payment_receivable_per_food_sample: "2",
				// can_sell_food_directly_to_guests: "TRUE",
				// can_sell_food_experiences_to_guests: "FALSE"
			},
			{
				subscription_code: 'KG_MSHIP3',
				subscription_name: 'Kodidi_Gues_Membership_3',
				price: '100',
				status: 'ACTIVE',
				description: ' Kodidi Guest Membership level 3',
				subscription_type: 'package',
				validity_in_months: '12',
				// comission_to_pay_percentage: "20",
				// payment_receivable_per_food_sample: "2",
				// can_sell_food_directly_to_guests: "TRUE",
				// can_sell_food_experiences_to_guests: "FALSE"
			},
		])
		.onConflict('subscription_code')
		.merge();
};

exports.down = function (knex) {
	const new_subscription_code = [
		'G_MSHIP2',
		'G_MSHIP3',
		'V_MOD',
		'V_ULTRA',
		'KG_MSHIP2',
		'KG_MSHIP3',
		'KV_MOD',
		'KV_ULTRA',
	];
	return knex('subscriptions')
		.whereIn('subscription_code', new_subscription_code)
		.del()
		.then(() => {
			return knex('subscriptions')
				.whereIn('subscription_code', new_subscription_code)
				.del();
		});
};
