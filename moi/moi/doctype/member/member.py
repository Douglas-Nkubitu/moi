# Copyright (c) 2023, Douglas Nkubitu and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import validate_email_address, validate_phone_number

class Member(Document):
	def validate(self):
		self.set_full_name()
		self.validate_email()
		self.validate_mobile_no()
		
	def set_full_name(self):
		self.full_name = " ".join(filter(None, [self.first_name, self.last_name]))

	def validate_mobile_no(self):
		validate_phone_number(self.mobile_no.strip(), True)

	def validate_email(self):
		validate_email_address(self.email.strip(), True)

@frappe.whitelist()
def assign_group(age_group):
    # Fetch the team_name and leader_email based on the age_group
    doc = frappe.get_doc('MoI Small Group', {'age_group': age_group})

    return {
        'team_name': doc.team_name,
		'team_leader': doc.team_leader,
		'leader_email': doc.leader_email	
    }

@frappe.whitelist()
def get_moi_small_group_data(moi_small_group):
    moi_small_group_data = frappe.get_doc("MoI Small Group", moi_small_group)
    return {
        'team_name': moi_small_group_data.team_name,
        'leader_name': moi_small_group_data.team_leader,
        'leader_phone_number': moi_small_group_data.leader_phone_number,
        'leader_email': moi_small_group_data.leader_email,
        'small_group_whatsapp_link': moi_small_group_data.small_group_whatsapp_link
    }

@frappe.whitelist()
def send_email(recipients, subject, content):
    frappe.sendmail(
        recipients=recipients,
        subject=subject,
        content=content
    )
