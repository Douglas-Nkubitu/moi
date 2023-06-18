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

frappe.ready(function() {
    frappe.web_form.on('first_name', () => {
        updateFullName();
    });

    frappe.web_form.on('last_name', () => {
        updateFullName();
    });

    function updateFullName() {
        let first_name = frappe.web_form.get_value('first_name');
        let last_name = frappe.web_form.get_value('last_name');

        if (first_name && last_name) {
            let full_name = `${first_name} ${last_name}`;

            // Set the value of the full_name field in the web form
            frappe.web_form.set_value('full_name', full_name);
			frappe.web_form.set_df_property('full_name', 'read_only', 1);
        }
    }
});


frappe.ready(function() {
	frappe.web_form.after_save('moi_small_group', (field, value) => {
		frappe.call({
			method: 'moi.moi.doctype.member.member.get_moi_small_group_data',
			args: {
				moi_small_group: value
			},
			callback: function(response) {
				if (response && response.message){
					// Fetch Leader name from the Moi Small Group
					var team_leader = response.message.leader_name
					// Fetch Leader email from the Moi Small Group
					var leader_email = response.message.leader_email
					// Fetch values from the web form
					let data = frappe.web_form.get_values();

					frappe.call({
						method: 'moi.moi.doctype.member.member.get_email_template',
						args: {
							template_name: 'New Member Registration',  // email template name
							doc: data,
							leader_name: team_leader
						},
						callback: function(emailResponse) {
							// Handle the email response
							if (emailResponse && emailResponse.message) {
								
								//Fetch email message from response
								var message = emailResponse.message
								
								// Send the email to the leader_email
								frappe.call({
									method: 'moi.moi.doctype.member.member.send_email',
									args: {
										recipients: leader_email,
										subject: message.subject,
										content: message.message
									},
									callback: function(r) {
										if(r.exc) {
										msgprint(r.exc);
											return;
										}
									}
								});
							}
						}
					});
				}
			}
		});
	});
})

frappe.ready(function() {
	frappe.web_form.after_save('moi_small_group', (field, value) => {
		// Fetch data from the Moi Small Group document
		frappe.call({
			method: 'moi.moi.doctype.member.member.get_moi_small_group_data',
			args: {
				moi_small_group: value
			},
			callback: function(response) {
				if (response && response.message){
				
					// Fetch Leader email from the Moi Small Group
					var leader_name = response.message.leader_name
					// Fetch Leader phone number from the Moi Small Group
					var leader_phone_number = response.message.leader_phone_number
					// Fetch Leader email from the Moi Small Group
					var leader_email = response.message.leader_email
					// Fetch small group whataspp from the Moi Small Group
					var small_group_whatsapp_link = response.message.small_group_whatsapp_link
					// Fetch values from the web form
					let data = frappe.web_form.get_values();

					frappe.call({
						method: 'moi.moi.doctype.member.member.get_email_template',
						args: {
							template_name: 'Registration Acknowledgment',  // email template name
							doc: data,
							leader_name: leader_name,
							leader_phone_number: leader_phone_number,
							leader_email: leader_email,
							small_group_whatsapp_link: small_group_whatsapp_link

						},
						callback: function(emailResponse) {
							// Handle the email response
							if (emailResponse && emailResponse.message) {

								// Get the email field value
								var email = data.email;
								//Fetch email message from response
								var message = emailResponse.message

								// Send the email to the member
								frappe.call({
									method: 'moi.moi.doctype.member.member.send_email',
									args: {
										recipients: email,
										subject: message.subject,
										content: message.message
									},
									callback: function(r) {
										if(r.exc) {
										msgprint(r.exc);
											return;
										}
									}
								});
							}
						}
					});
				}
			}
		});
	})
})

frappe.ready(function(){
	frappe.web_form.after_save('moi_small_group', (field, value) => {
		frappe.call({
			method: 'moi.moi.doctype.member.member.get_moi_small_group_data',
			args: {
				moi_small_group: value
			},
			callback: function(response) {
				if (response && response.message){

					// Fetch Leader name from the Moi Small Group
					var leader_name = response.message.leader_name
					// Fetch Leader name from the Moi Small Group
					var leader_phone_number = response.message.leader_phone_number
					// Fetch values from the web form
					let data = frappe.web_form.get_values();
					
					var message = "Hi " + leader_name + ", " + data.full_name + " has been allocated your Group, Kindly reach out via " + data.mobile_no +".";
					
					frappe.call({
						method: "frappe.core.doctype.sms_settings.sms_settings.send_sms",
						args: {
							receiver_list: [leader_phone_number],
							msg: message,
						},
						callback: function(r) {
							if(r.exc) {
							msgprint(r.exc);
								return;
							}
						}
					});
				}
			}
		});
	})
})