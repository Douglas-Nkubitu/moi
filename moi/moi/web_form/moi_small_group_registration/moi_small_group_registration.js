frappe.ready(function() {
	frappe.web_form.on('age_group', (field, value) => {
		frappe.call({
			method: 'moi.moi.doctype.member.member.allocate_small_group',
			args: {
				age_group: value
			},
			callback: function(response) {
				frappe.web_form.set_value('moi_small_group', response.message.team_name);
				frappe.web_form.set_df_property('moi_small_group', 'read_only', 1);
			}
		});
	});
})