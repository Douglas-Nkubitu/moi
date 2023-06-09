// Copyright (c) 2023, Douglas Nkubitu and contributors
// For license information, please see license.txt

frappe.ui.form.on('Member', {
	refresh: function(frm) {
		frm.set_query("department", () => {
			return {
				filters: {
					is_group: 0,
				}
			}
		});

		frm.set_query("member_group", () => {
			return {
				filters: {
					is_group: 0,
				}
			}
		});
	}
});

frappe.ui.form.on('Member', {
    age_group: function(frm) {
        // Get the selected age_group from the Member DocType
        var ageGroup = frm.doc.age_group;
		frappe.call({
			method: 'moi.moi.doctype.member.member.allocate_small_group',
			args: {
				age_group: ageGroup
			},
			callback: function(response){
				if (response && response.message){
					frm.set_value('moi_small_group', response.message.team_name);

				}
			}
		})
    }
});

frappe.ui.form.on('Member', {
	after_save: function (frm) {
		// var send_sms = function (frm) {
		// 	// Fetch data from the Moi Small Group document
		// 	frappe.call({
		// 		method: 'moi.moi.doctype.member.member.get_moi_small_group_data',
		// 		args: {
		// 			moi_small_group: frm.doc.moi_small_group
		// 		},
		// 		callback: function(response) {
		// 			if (response && response.message) {
		// 				// Fetch Leader name from the Moi Small Group
		// 				var leader_name = response.message.leader_name;
		// 				// Fetch Leader phone number from the Moi Small Group
		// 				var leader_phone_number = response.message.leader_phone_number;

		// 				var message = "Hi " + leader_name + ", " + frm.doc.full_name + " has been allocated your Group, Kindly reach out via " + frm.doc.mobile_no + ".";
		// 				// frappe.msgprint(message)
		// 				frappe.call({
		// 					method: "frappe.core.doctype.sms_settings.sms_settings.send_sms",
		// 					args: {
		// 						receiver_list: [leader_phone_number],
		// 						msg: message,
		// 					},
		// 					callback: function(r) {
		// 						if (r.exc) {
		// 							msgprint(r.exc);
		// 							return;
		// 						}
		// 					}
		// 				});
		// 			}
		// 		}
		// 	});
		// };

		// send_sms(frm);

		// Fetch data from the Moi Small Group document for sending email
		frappe.call({
			method: 'moi.moi.doctype.member.member.get_moi_small_group_data',
			args: {
				moi_small_group: frm.doc.moi_small_group
			},
			callback: function(response) {
				if (response && response.message) {
					// Fetch Leader name from the Moi Small Group
					var team_leader = response.message.leader_name;
					// Fetch Leader email from the Moi Small Group
					var leader_email = response.message.leader_email;

					frappe.call({
						method: 'moi.moi.doctype.member.member.get_email_template',
						args: {
							template_name: 'New Member Registration',
							doc: frm.doc,
							leader_name: team_leader
						},
						callback: function(emailResponse) {
							// Handle the email response
							if (emailResponse && emailResponse.message) {
								// Fetch email message from response
								var message = emailResponse.message;

								// Send the email to the leader_email
								frappe.call({
									method: 'moi.moi.doctype.member.member.send_email',
									args: {
										recipients: leader_email,
										subject: message.subject,
										content: message.message
									},
									callback: function(r) {
										if (r.exc) {
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

		// Fetch data from the Moi Small Group document for sending acknowledgment email
        frappe.call({
            method: 'moi.moi.doctype.member.member.get_moi_small_group_data',
            args: {
                moi_small_group: frm.doc.moi_small_group
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

					frappe.call({
						method: 'moi.moi.doctype.member.member.get_email_template',
						args: {
							template_name: 'Registration Acknowledgment',  // email template name
							doc: frm.doc,
							leader_name: leader_name,
							leader_phone_number: leader_phone_number,
							leader_email: leader_email,
							small_group_whatsapp_link: small_group_whatsapp_link

						},
						callback: function(emailResponse) {
							// Handle the email response
							if (emailResponse && emailResponse.message) {

								// Get the email field value
								var email = frm.doc.email;
								//Fetch email message from response
								var message = emailResponse.message

								// Send the email to the leader_email
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
	}
})
