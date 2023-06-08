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
	# Fetch the team_name based on the age_group
	team_name = frappe.db.get_value('MoI Small Group', {'age_group': age_group}, 'team_name')

	return {
		'team_name': team_name
	}
