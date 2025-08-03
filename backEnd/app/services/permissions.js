const permission = {
  DASHBOARD: {
    MODULE_CATEGORY: "Dashboard",
    PERMISSIONS_KEY: {
      VIEW: "dashboard_view",
    },
  },
  EMPLOYER: {
    MODULE_CATEGORY: "Employer",
    PERMISSIONS_KEY: {
      CREATE: "employer_create",
      EDIT: "employer_edit",
      VIEW: "employer_view",
      CHANGE_STATUS: "employer_change_status",
      IMPORT: "employer_import",
      DELETE: "employer_delete",
      DOWNLOAD: "employer_download",
    },
  },
  ADVISER: {
    MODULE_CATEGORY: "Adviser",
    PERMISSIONS_KEY: {
      CREATE: "adviser_create",
      EDIT: "adviser_edit",
      VIEW: "adviser_view",
      CHANGE_STATUS: "adviser_change_status",
      IMPORT: "adviser_import",
      DELETE: "adviser_delete",
      DOWNLOAD: "adviser_download",
    },
  },
  APPLICANT: {
    MODULE_CATEGORY: "Applicant",
    PERMISSIONS_KEY: {
      CREATE: "applicant_create",
      EDIT: "applicant_edit",
      VIEW: "applicant_view",
      CHANGE_STATUS: "applicant_change_status",
      IMPORT: "applicant_import",
      DELETE: "applicant_delete",
      DOWNLOAD: "applicant_download",
    },
  },
  ADMIN_USER: {
    MODULE_CATEGORY: "Admin User",
    PERMISSIONS_KEY: {
      CREATE: "admin_user_create",
      EDIT: "admin_user_edit",
      VIEW: "admin_user_view",
      CHANGE_STATUS: "admin_user_change_status",
      IMPORT: "admin_user_import",
      DELETE: "admin_user_delete",
      DOWNLOAD: "admin_user_download",
    },
  },
  CMS: {
    MODULE_CATEGORY: "CMS",
    PERMISSIONS_KEY: {
      CREATE: "cms_pages_create",
      EDIT: "cms_pages_edit",
      VIEW: "cms_pages_view",
      CHANGE_STATUS: "cms_pages_change_status",
      DELETE: "cms_pages_delete",
    },
  },
  SUBSCRIPTION: {
    MODULE_CATEGORY: "Subscription",
    PERMISSIONS_KEY: {
      EDIT: "subscription_edit",
      VIEW: "subscription_view",
    },
  },
  ADDONS: {
    MODULE_CATEGORY: "addons",
    PERMISSIONS_KEY: {
      CREATE: "addons_create",
      EDIT: "addons_edit",
      VIEW: "addons_view",
      CHANGE_STATUS: "addons_change_status",
    },
  },
  MASTER_INDUSTRY: {
    MODULE_CATEGORY: "master-industry",
    PERMISSIONS_KEY: {
      CREATE: "master_industry_create",
      EDIT: "master_industry_edit",
      VIEW: "master_industry_view",
      CHANGE_STATUS: "master_industry_change_status",
      IMPORT: "master_industry_import",
      DOWNLOAD: "master_industry__download",
    },
  },
  MASTER_SKILLS: {
    MODULE_CATEGORY: "master-skills",
    PERMISSIONS_KEY: {
      CREATE: "master_skills_create",
      EDIT: "master_skills_edit",
      VIEW: "master_skills_view",
      CHANGE_STATUS: "master_skills_change_status",
      IMPORT: "master_skills_import",
      DOWNLOAD: "master_skills_download",
    },
  },
  MASTER_JOB_TITLE: {
    MODULE_CATEGORY: "master-job-title",
    PERMISSIONS_KEY: {
      CREATE: "master_skills_create",
      EDIT: "master_skills_edit",
      VIEW: "master_skills_view",
      CHANGE_STATUS: "master_skills_change_status",
      IMPORT: "master_skills_import",
      DOWNLOAD: "master_skills_download",
    },
  },
  MASTER_LEVELS: {
    MODULE_CATEGORY: "master-levels",
    PERMISSIONS_KEY: {
      CREATE: "master_levels_create",
      EDIT: "master_levels_edit",
      VIEW: "master_levels_view",
      CHANGE_STATUS: "master_levels_change_status",
      IMPORT: "master_levels_import",
      DOWNLOAD: "master_levels_download",
    },
  },
  MASTER_SKILL_LEVELS: {
    MODULE_CATEGORY: "master-skill-levels",
    PERMISSIONS_KEY: {
      CREATE: "master_skill_levels_create",
      EDIT: "master_skill_levels_edit",
      VIEW: "master_skill_levels_view",
      CHANGE_STATUS: "master_skill_levels_change_status",
      IMPORT: "master_skill_levels_import",
      DOWNLOAD: "master_skill_levels_download",
    },
  },
  MASTER_LICENSE: {
    MODULE_CATEGORY: "master-license",
    PERMISSIONS_KEY: {
      CREATE: "master_license_create",
      EDIT: "master_license_edit",
      VIEW: "master_license_view",
      CHANGE_STATUS: "master_license_change_status",
      IMPORT: "master_license_import",
      DOWNLOAD: "master_license_download",
    },
  },
  MASTER_ANSCO: {
    MODULE_CATEGORY: "master-ansco",
    PERMISSIONS_KEY: {
      CREATE: "master_ansco_create",
      EDIT: "master_ansco_edit",
      VIEW: "master_ansco_view",
      CHANGE_STATUS: "master_ansco_change_status",
      IMPORT: "master_ansco_import",
      DOWNLOAD: "master_ansco_download",
    },
  },
  MASTER_AVAILABILITY: {
    MODULE_CATEGORY: "master-availability",
    PERMISSIONS_KEY: {
      CREATE: "master_availability_create",
      EDIT: "master_availability_edit",
      VIEW: "master_availability_view",
      CHANGE_STATUS: "master_availability_change_status",
      IMPORT: "master_availability_import",
      DOWNLOAD: "master_availability_download",
    },
  },
  MASTER_HOURLY_RATE: {
    MODULE_CATEGORY: "master-hourly-rate",
    PERMISSIONS_KEY: {
      CREATE: "master_hourly_create",
      EDIT: "master_hourly_edit",
      VIEW: "master_hourly_view",
      CHANGE_STATUS: "master_hourly_change_status",
      IMPORT: "master_hourly_import",
      DOWNLOAD: "master_hourly_download",
    },
  },
  MASTER_YEARLY_RATE: {
    MODULE_CATEGORY: "master-yearly-rate",
    PERMISSIONS_KEY: {
      CREATE: "master_yearly_create",
      EDIT: "master_yearly_edit",
      VIEW: "master_yearly_view",
      CHANGE_STATUS: "master_yearly_change_status",
      IMPORT: "master_yearly_import",
      DOWNLOAD: "master_yearly_download",
    },
  },
  MASTER_EXPERIENCE: {
    MODULE_CATEGORY: "master-experience",
    PERMISSIONS_KEY: {
      CREATE: "master_experience_create",
      EDIT: "master_experience_edit",
      VIEW: "master_experience_view",
      CHANGE_STATUS: "master_experience_change_status",
      IMPORT: "master_experience_import",
      DOWNLOAD: "master_experience_download",
    },
  },
  MASTER_ACCREDITATION: {
    MODULE_CATEGORY: "master-accreditation",
    PERMISSIONS_KEY: {
      CREATE: "master_accreditation_create",
      EDIT: "master_accreditation_edit",
      VIEW: "master_accreditation_view",
      CHANGE_STATUS: "master_accreditation_change_status",
      IMPORT: "master_accreditation_import",
      DOWNLOAD: "master_accreditation_download",
    },
  },
  MASTER_QUALIFICATION: {
    MODULE_CATEGORY: "master-qualification",
    PERMISSIONS_KEY: {
      CREATE: "master_qualification_create",
      EDIT: "master_qualification_edit",
      VIEW: "master_qualification_view",
      CHANGE_STATUS: "master_qualification_change_status",
      IMPORT: "master_qualification_import",
      DOWNLOAD: "master_qualification_download",
    },
  },
  MASTER_IMMIGRATION_STATUS: {
    MODULE_CATEGORY: "master-immigration-status",
    PERMISSIONS_KEY: {
      CREATE: "master_immigration_status_create",
      EDIT: "master_immigration_status_edit",
      VIEW: "master_immigration_status_view",
      CHANGE_STATUS: "master_immigration_status_change_status",
      IMPORT: "master_immigration_status_import",
      DOWNLOAD: "master_immigration_status_download",
    },
  },
  MASTER_PARTNERS: {
    MODULE_CATEGORY: "master-partners",
    PERMISSIONS_KEY: {
      CREATE: "master_partners_create",
      EDIT: "master_partners_edit",
      VIEW: "master_partners_view",
      CHANGE_STATUS: "master_partners_change_status",
      IMPORT: "master_partners_import",
    },
  },
  COUPONS: {
    MODULE_CATEGORY: "coupons",
    PERMISSIONS_KEY: {
      CREATE: "coupons_create",
      EDIT: "coupons_edit",
      VIEW: "coupons_view",
      CHANGE_STATUS: "coupons_change_status",
      DELETE: "coupons_delete",
      DOWNLOAD: "coupons_download",
    },
  },
  GENERAL_SETTINGS: {
    MODULE_CATEGORY: "general-settings",
    PERMISSIONS_KEY: {
      CREATE: "general_settings_create",
      EDIT: "general_settings_edit",
      VIEW: "general_settings_view",
    },
  },
  SOCIAL_MEDIA_SETTINGS: {
    MODULE_CATEGORY: "social-media-settings",
    PERMISSIONS_KEY: {
      CREATE: "social_media_settings_create",
      EDIT: "social_media_settings_edit",
      VIEW: "social_media_settings_view",
      CHANGE_STATUS: "social_media_change_status",
    },
  },
  PAYMENT_GATEWAY_SETTINGS: {
    MODULE_CATEGORY: "payment-gateway-settings",
    PERMISSIONS_KEY: {
      CREATE: "payment_gateway_settings_create",
      EDIT: "payment_gateway_settings_edit",
      VIEW: "payment_gateway_settings_view",
      CHANGE_STATUS: "payment_gateway_settings_change_status",
    },
  },
  SMTP_SETTINGS: {
    MODULE_CATEGORY: "smtp-settings",
    PERMISSIONS_KEY: {
      CREATE: "smtp_settings_create",
      EDIT: "smtp_settings_edit",
      VIEW: "smtp_settings_view",
    },
  },
  EMAIL_SETTINGS: {
    MODULE_CATEGORY: "email-settings",
    PERMISSIONS_KEY: {
      CREATE: "email_settings_create",
      EDIT: "email_settings_edit",
      VIEW: "email_settings_view",
    },
  },
  ERROR_MESSAGES_SETTINGS: {
    MODULE_CATEGORY: "error-messages-settings",
    PERMISSIONS_KEY: {
      CREATE: "error_messages_settings_create",
      EDIT: "error_messages_settings_edit",
      VIEW: "error_messages_settings_view",
    },
  },
  STATIC_LABEL_SETTINGS: {
    MODULE_CATEGORY: "static-label-settings",
    PERMISSIONS_KEY: {
      CREATE: "static_label_settings_create",
      EDIT: "static_label_settings_edit",
      VIEW: "static-label_settings_view",
    },
  },
  ROLE: {
    MODULE_CATEGORY: "Role",
    PERMISSIONS_KEY: {
      CREATE: "role_create",
      EDIT: "role_edit",
      VIEW: "role_view",
      DELETE: "role_delete",
      CHANGE_PERMISSION: "role_change_permission",
    },
  },
  NOTIFICATION: {
    MODULE_CATEGORY: "notification",
    PERMISSIONS_KEY: {
      VIEW: "notification_view",
      DELETE: "notification_delete",
      DOWNLOAD: "notification_download",
      MARK_AS_READ: "notification_mark_as_read",
    },
  },
  JOB_MANAGEMENT: {
    MODULE_CATEGORY: "job-management",
    PERMISSIONS_KEY: {
      EDIT: "job_management_edit",
      CHANGE_STATUS: "job_management_change_status",
      IMPORT: "job_management_import",
      VIEW: "job_management_view",
      DELETE: "job_management_delete",
      DOWNLOAD: "job_management_download",
      MARK_FEATURED: "job_management_mark_as_featured",
    },
  },
  REPORTS: {
    MODULE_CATEGORY: "reports",
    PERMISSIONS_KEY: {
      VIEW: "report_view",
      SHARE: "report_share",
      DOWNLOAD: "report_download",
    },
  },
  FEEDBACK_MANAGEMENT: {
    MODULE_CATEGORY: "feedback-management",
    PERMISSIONS_KEY: {
      VIEW: "feedback_management_view",
      EDIT: "feedback_management_edit",
      DELETE: "feedback_management_delete",
      DOWNLOAD: "feedback_management_download",
    },
  },
  GENERAL_EMAIL_TEMPLATES: {
    MODULE_CATEGORY: "general-email-templates",
    PERMISSIONS_KEY: {
      VIEW: "general_email_view",
      EDIT: "general_email_edit",
    },
  },
  CAMPAIGN_EMAIL_TEMPLATES: {
    MODULE_CATEGORY: "campaign-email-templates",
    PERMISSIONS_KEY: {
      CREATE: "campaign_email_create",
      VIEW: "campaign_email_view",
      EDIT: "campaign_email_edit",
      CHANGE_STATUS: "campaign_email_change_status",
      DELETE: "campaign_email_delete",
      SEND: "campaign_email_send",
    },
  },
  FAQ_CATEGORY: {
    MODULE_CATEGORY: "Faq-category",
    PERMISSIONS_KEY: {
      CREATE: "faq_category_create",
      VIEW: "faq_category_view",
      EDIT: "faq_category_edit",
      CHANGE_STATUS: "faq_category_change_status",
      DELETE: "faq_category_delete",
    },
  },
  FAQ: {
    MODULE_CATEGORY: "FAQ",
    PERMISSIONS_KEY: {
      CREATE: "faq_create",
      VIEW: "faq_view",
      EDIT: "faq_edit",
      CHANGE_STATUS: "faq_change_status",
      DELETE: "faq_delete",
    },
  },
  TUTORIAL_MANAGEMENT: {
    MODULE_CATEGORY: "tutorial-management",
    PERMISSIONS_KEY: {
      CREATE: "tutorial_create",
      VIEW: "tutorial_view",
      EDIT: "tutorial_edit",
      DELETE: "tutorial_delete",
    },
  },
  TESTIMONIAL_MANAGEMENT: {
    MODULE_CATEGORY: "testimonial-management",
    PERMISSIONS_KEY: {
      CREATE: "testimonial_create",
      VIEW: "testimonial_view",
      EDIT: "testimonial_edit",
      DELETE: "testimonial_delete",
    },
  },
};

module.exports = permission;
