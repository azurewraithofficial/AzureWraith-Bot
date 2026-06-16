export const restrictionConfig = {
    // Authorized Staff Role Snowflake IDs allowed to bypass restrictions
    authorizedRoles: [
        '1508528013288144926',
        '1508528029519974532',
        '1508528030157373702',
        '1508528030761353467',
        '1508528031403081748',
        '1508528032145735870',
        '1508528032313507851',
        '1508778653104865350',
        '1508528033420677181',
        '1508528034024783943'
    ],

    // Target file paths that are strictly tied to the security clearance above
    // Note: Ensure these paths match what your command handler records (e.g., relative to project root)
    restrictedPaths: [
        'src/commands/report/report.js',
        'src/commands/tickets/ticket.js',
        'src/commands/admin/apply.js',
        'src/commands/admin/applyEvent.js',
        'src/commands/admin/applyPartner.js',
        'src/commands/admin/giveaway.js',
        'src/commands/admin/security.js',
        'src/commands/admin/welcome.js',
        'src/commands/moderation/clearwarnings.js',
        'src/commands/moderation/kick.js',
        'src/commands/moderation/warn.js',
        'src/commands/utils/rules.js',
        // Add additional file paths here as needed
    ]
};
