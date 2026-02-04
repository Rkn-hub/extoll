// Supabase Configuration for Extoll Portfolio
// Replace these with your actual Supabase project credentials

const SUPABASE_CONFIG = {
    url: 'https://lvtkoryorwzknxzfpyzz.supabase.co', // Your Supabase URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2dGtvcnlvcnd6a254emZweXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTAyODEsImV4cCI6MjA4MzM4NjI4MX0.eMZNHWpzSU-fSUFohCJLYuTzbqv9Yu3fY_BOLqa5ixs', // Your Supabase anon key

    // Admin credentials - DO NOT hardcode here!
    // These should be entered via the admin login UI
    // The admin panel uses Supabase Auth for secure authentication
    adminEmail: null, // Enter via login form
    adminPassword: null, // Enter via login form

    // Single bucket configuration with structured project folders
    bucket: 'extoll-portfolio', // Main bucket name (public)

    // Project folder structure within the bucket
    projectStructure: {
        metadata: 'project.json',    // Project metadata file in each project folder
        thumbnail: 'thumbnail',      // Thumbnail subfolder
        images: 'images',           // Images subfolder
        videos: 'videos'            // Videos subfolder
    },

    // Website global settings and assets
    websiteAssets: {
        folder: 'website-assets',
        subfolders: {
            logo: 'logo',
            banner: 'banner',
            icons: 'icons'
        }
    },

    // Global website configuration files
    globalSettings: {
        folder: 'website-config',
        files: {
            content: 'website-content.json',    // Website content settings
            team: 'team-info.json',            // Team information
            social: 'social-links.json'        // Social media links
        }
    }
};

// Initialize Supabase client
let configSupabase;

// Function to initialize Supabase
function initializeSupabase() {
    if (typeof window !== 'undefined' && window.supabase) {
        // Only create client if not already created
        if (!configSupabase) {
            configSupabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        }
        console.log('✅ Supabase initialized successfully');
        return true;
    } else {
        console.error('❌ Supabase library not loaded');
        return false;
    }
}

// Authentication functions with enhanced error handling
async function signInAdmin(email, password) {
    try {
        // Validate credentials are provided
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        console.log('🔐 Attempting to sign in with:', email);

        // Ensure Supabase is initialized first
        if (!configSupabase) {
            console.log('🔧 Initializing Supabase client...');
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }

        if (!configSupabase) {
            throw new Error('Supabase client not initialized');
        }

        const { data, error } = await configSupabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('🚫 Authentication error details:', {
                message: error.message,
                status: error.status,
                statusCode: error.status
            });
            throw error;
        }

        if (!data.user) {
            throw new Error('No user data returned from authentication');
        }

        console.log('✅ Admin signed in successfully:', {
            email: data.user.email,
            id: data.user.id,
            confirmed: data.user.email_confirmed_at ? 'Yes' : 'No'
        });

        return { success: true, user: data.user };
    } catch (error) {
        console.error('❌ Admin sign in failed:', error.message);

        // Provide specific error guidance
        if (error.message.includes('Invalid login credentials')) {
            console.error('💡 Solution: Check if admin user exists in Supabase Authentication → Users');
        } else if (error.message.includes('Email not confirmed')) {
            console.error('💡 Solution: Confirm email in Supabase or disable email confirmation');
        } else if (error.message.includes('Too many requests')) {
            console.error('💡 Solution: Wait a few minutes before trying again');
        }

        return { success: false, error: error.message };
    }
}

async function signOutAdmin() {
    try {
        const { error } = await configSupabase.auth.signOut();
        if (error) throw error;

        console.log('✅ Admin signed out successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Admin sign out failed:', error.message);
        return { success: false, error: error.message };
    }
}

async function getCurrentUser() {
    try {
        const { data: { user } } = await configSupabase.auth.getUser();

        if (user) {
            console.log('👤 Current authenticated user:', {
                email: user.email,
                id: user.id,
                confirmed: user.email_confirmed_at ? 'Yes' : 'No'
            });
        } else {
            console.log('👤 No authenticated user');
        }

        return user;
    } catch (error) {
        console.error('❌ Get current user failed:', error.message);
        return null;
    }
}

// Function to test portfolio bucket access
async function testPortfolioBucketAccess() {
    try {
        console.log('🧪 Testing portfolio bucket access...');

        // Ensure Supabase is initialized first
        if (!configSupabase) {
            console.log('🔧 Initializing Supabase client for bucket test...');
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }

        // Try to list files in portfolio bucket
        const { data, error } = await configSupabase.storage
            .from(SUPABASE_CONFIG.bucket)
            .list('', { limit: 1 });

        if (error) {
            console.error('❌ Portfolio bucket access failed:', error.message);

            if (error.message.includes('not found')) {
                console.error('💡 Solution: Create the extoll-portfolio bucket in Supabase Storage');
            } else if (error.message.includes('access denied') || error.message.includes('unauthorized')) {
                console.error('💡 Solution: Check bucket policies and authentication');
            }

            return { success: false, error: error.message };
        }

        console.log('✅ Portfolio bucket access successful');
        return { success: true, data };
    } catch (error) {
        console.error('❌ Portfolio bucket test failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Project metadata functions using private bucket storage
async function createProject(projectData) {
    try {
        // Ensure Supabase is initialized first
        if (!configSupabase) {
            console.log('🔧 Initializing Supabase client for createProject...');
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }

        // Generate a proper UUID for project ID
        const generateProjectUUID = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        // Add timestamp and unique ID (use existing ID if provided, otherwise generate new one)
        const projectWithMeta = {
            ...projectData,
            id: projectData.id || generateProjectUUID(),
            created_at: projectData.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Save to database table first (for public access)
        try {
            const { data: dbData, error: dbError } = await configSupabase
                .from('projects')
                .insert([{
                    title: projectWithMeta.title,
                    key: projectWithMeta.key,
                    category: projectWithMeta.category,
                    description: projectWithMeta.description,
                    count: projectWithMeta.count || 1,
                    thumbnail_url: projectWithMeta.thumbnail_url || null
                }])
                .select()
                .single();

            if (!dbError && dbData) {
                console.log('✅ Project saved to database:', dbData);
                // Use the database-generated ID and timestamps
                projectWithMeta.id = dbData.id;
                projectWithMeta.created_at = dbData.created_at;
                projectWithMeta.updated_at = dbData.updated_at;
            }
        } catch (dbError) {
            console.warn('⚠️ Failed to save to database, continuing with metadata only:', dbError.message);
        }

        // Save project metadata to portfolio bucket in project folder
        try {
            const metadataPath = `${projectData.key}/${SUPABASE_CONFIG.projectStructure.metadata}`;

            const { data, error } = await configSupabase.storage
                .from(SUPABASE_CONFIG.bucket)
                .upload(metadataPath, JSON.stringify(projectWithMeta, null, 2), {
                    contentType: 'application/json',
                    upsert: true // Allow overwriting if exists
                });

            if (error) {
                console.warn('⚠️ Failed to save project metadata:', error.message);
            } else {
                console.log('✅ Project metadata stored in portfolio bucket:', metadataPath);
            }
        } catch (metadataError) {
            console.warn('⚠️ Project metadata save failed:', metadataError.message);
        }

        console.log('✅ Project created successfully:', projectWithMeta);
        return { success: true, data: projectWithMeta };
    } catch (error) {
        console.error('❌ Create project failed:', error.message);
        return { success: false, error: error.message };
    }
}

async function getProjects() {
    try {
        // Ensure Supabase is initialized first
        if (!configSupabase) {
            console.log('🔧 Initializing Supabase client for getProjects...');
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }

        // First try to get projects from the database (public access)
        try {
            const { data: dbProjects, error: dbError } = await configSupabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (!dbError && dbProjects) {
                console.log('✅ Projects fetched from database:', dbProjects.length);

                // If database has projects, return them
                if (dbProjects.length > 0) {
                    return { success: true, data: dbProjects };
                }

                // If database is empty, try to sync from portfolio bucket
                console.log('📦 Database empty, attempting to sync from portfolio bucket...');
                const syncResult = await syncPortfolioToDatabase();
                if (syncResult.success && syncResult.data.length > 0) {
                    return { success: true, data: syncResult.data };
                }
            }
        } catch (dbError) {
            console.log('⚠️ Database access failed, trying portfolio bucket:', dbError.message);
        }

        // Fallback to scanning portfolio bucket for project folders
        try {
            console.log('🔍 Scanning portfolio bucket for project folders...');

            // List all folders in the portfolio bucket (excluding website-assets)
            const { data: folders, error: listError } = await configSupabase.storage
                .from(SUPABASE_CONFIG.bucket)
                .list('', { limit: 100 });

            if (listError) throw listError;

            if (!folders || folders.length === 0) {
                console.log('📭 No folders found in portfolio bucket');
                return { success: true, data: [] };
            }

            // Filter out system folders and get only project folders
            const projectFolders = folders.filter(folder =>
                folder.name !== SUPABASE_CONFIG.websiteAssets.folder &&
                folder.name !== SUPABASE_CONFIG.globalSettings.folder &&
                folder.name !== '.emptyFolderPlaceholder'
            );

            console.log('📁 Found project folders:', projectFolders.map(f => f.name));

            // Download project.json from each project folder
            const projects = [];
            for (const folder of projectFolders) {
                try {
                    const metadataPath = `${folder.name}/${SUPABASE_CONFIG.projectStructure.metadata}`;

                    const { data: fileData, error: downloadError } = await configSupabase.storage
                        .from(SUPABASE_CONFIG.bucket)
                        .download(metadataPath);

                    if (downloadError) {
                        console.warn('⚠️ No metadata found for project:', folder.name);
                        continue;
                    }

                    const text = await fileData.text();
                    const project = JSON.parse(text);
                    projects.push(project);

                    console.log('✅ Loaded project metadata:', project.title);
                } catch (parseError) {
                    console.warn('⚠️ Failed to parse metadata for:', folder.name, parseError);
                }
            }

            // Sort by created_at descending
            projects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            console.log('✅ Projects fetched from portfolio bucket:', projects.length);
            return { success: true, data: projects };
        } catch (portfolioError) {
            console.log('⚠️ Portfolio bucket access failed:', portfolioError.message);
        }

        // No fallback - return empty array
        console.log('📭 No projects found in any source');
        return { success: true, data: [] };

    } catch (error) {
        console.error('❌ Get projects failed:', error.message);
        return { success: true, data: [] };
    }
}

async function getProjectByKey(key) {
    try {
        // First try to get project from the database (public access)
        try {
            const { data: dbProject, error: dbError } = await configSupabase
                .from('projects')
                .select('*')
                .eq('key', key)
                .single();

            if (!dbError && dbProject) {
                console.log('✅ Project fetched from database by key:', dbProject);
                return { success: true, data: dbProject };
            }
        } catch (dbError) {
            console.log('⚠️ Database access failed, trying portfolio bucket:', dbError.message);
        }

        // Fallback to portfolio bucket project folder
        try {
            const metadataPath = `${key}/${SUPABASE_CONFIG.projectStructure.metadata}`;

            const { data: fileData, error } = await configSupabase.storage
                .from(SUPABASE_CONFIG.bucket)
                .download(metadataPath);

            if (error) throw error;

            const text = await fileData.text();
            const project = JSON.parse(text);

            console.log('✅ Project fetched from portfolio bucket by key:', project);
            return { success: true, data: project };
        } catch (portfolioError) {
            console.log('⚠️ Portfolio bucket access failed:', portfolioError.message);
        }

        // Final fallback to localStorage
        console.log('📦 Falling back to localStorage for project:', key);
        const localProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        const project = localProjects.find(p => p.key === key);

        if (project) {
            console.log('✅ Project found in localStorage:', project);
            return { success: true, data: project };
        }

        return { success: false, error: 'Project not found' };

    } catch (error) {
        console.error('❌ Get project by key failed:', error.message);
        return { success: false, error: error.message };
    }
}

async function deleteProjectMetadata(projectKey) {
    try {
        // Ensure Supabase is initialized first
        if (!configSupabase) {
            console.log('🔧 Initializing Supabase client for deleteProject...');
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }

        // Delete from database table first (for public access)
        try {
            const { error: dbError } = await configSupabase
                .from('projects')
                .delete()
                .eq('key', projectKey);

            if (!dbError) {
                console.log('✅ Project deleted from database:', projectKey);
            } else {
                console.warn('⚠️ Failed to delete from database:', dbError.message);
            }
        } catch (dbError) {
            console.warn('⚠️ Database deletion failed:', dbError.message);
        }

        // Delete project.json from the project folder in portfolio bucket
        const metadataPath = `${projectKey}/${SUPABASE_CONFIG.projectStructure.metadata}`;

        const { data, error } = await configSupabase.storage
            .from(SUPABASE_CONFIG.bucket)
            .remove([metadataPath]);

        if (error) {
            console.warn('⚠️ Failed to delete project metadata file:', error.message);
            // Don't throw error here as the main deletion should continue
        } else {
            console.log('✅ Project metadata deleted from portfolio bucket:', projectKey);
        }

        return { success: true, data };
    } catch (error) {
        console.error('❌ Delete project metadata failed:', error.message);
        return { success: false, error: error.message };
    }
}

async function updateProject(projectKey, projectData) {
    try {
        // Ensure Supabase is initialized first
        if (!configSupabase) {
            console.log('🔧 Initializing Supabase client for updateProject...');
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }

        // Add updated timestamp
        const projectWithMeta = {
            ...projectData,
            updated_at: new Date().toISOString()
        };

        // Update in database table first (for public access)
        try {
            const { data: dbData, error: dbError } = await configSupabase
                .from('projects')
                .update({
                    title: projectWithMeta.title,
                    category: projectWithMeta.category,
                    description: projectWithMeta.description,
                    count: projectWithMeta.count || 1,
                    thumbnail_url: projectWithMeta.thumbnail_url || null
                })
                .eq('key', projectKey)
                .select()
                .single();

            if (!dbError && dbData) {
                console.log('✅ Project updated in database:', dbData);
                // Use the database timestamps
                projectWithMeta.updated_at = dbData.updated_at;
            }
        } catch (dbError) {
            console.warn('⚠️ Failed to update in database, continuing with metadata only:', dbError.message);
        }

        // Also update project.json in portfolio bucket (for consistency)
        try {
            const metadataPath = `${projectKey}/${SUPABASE_CONFIG.projectStructure.metadata}`;

            const { data, error } = await configSupabase.storage
                .from(SUPABASE_CONFIG.bucket)
                .upload(metadataPath, JSON.stringify(projectWithMeta, null, 2), {
                    contentType: 'application/json',
                    upsert: true // Allow overwriting
                });

            if (error) {
                console.warn('⚠️ Failed to update project metadata in portfolio bucket:', error.message);
            } else {
                console.log('✅ Project metadata also updated in portfolio bucket');
            }
        } catch (metadataError) {
            console.warn('⚠️ Portfolio bucket metadata update failed:', metadataError.message);
        }

        console.log('✅ Project updated successfully:', projectWithMeta);
        return { success: true, data: projectWithMeta };
    } catch (error) {
        console.error('❌ Update project failed:', error.message);
        return { success: false, error: error.message };
    }
}

// ========================================
// OPTIMIZED PUBLIC ACCESS FUNCTIONS
// ========================================
// These functions take advantage of the public metadata bucket
// for faster loading without authentication requirements

// Fast public project loading (no auth required) - Enhanced with bulletproof filtering
async function getProjectsPublic() {
    try {
        if (!configSupabase) {
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }

        console.log('🚀 Loading projects from portfolio bucket...');

        // List all folders in portfolio bucket
        const { data: folders, error: listError } = await configSupabase.storage
            .from(SUPABASE_CONFIG.bucket)
            .list('');

        if (listError) {
            console.error('❌ Failed to list portfolio folders:', listError.message);
            return { success: false, error: listError.message };
        }

        if (!folders || folders.length === 0) {
            console.log('📁 No folders found in portfolio bucket');
            return { success: true, data: [] };
        }

        // Enhanced filtering - more comprehensive system folder detection
        const systemFolders = [
            SUPABASE_CONFIG.websiteAssets.folder,    // 'website-assets'
            SUPABASE_CONFIG.globalSettings.folder,   // 'website-config'
            'logo',                                   // legacy logo folder
            'banner',                                 // legacy banner folder
            '.emptyFolderPlaceholder',
            'website-assets',                         // explicit check
            'website-config',                         // explicit check
            'assets',                                 // common asset folder
            'config'                                  // common config folder
        ];

        const projectFolders = folders.filter(folder => {
            const folderName = folder.name.toLowerCase();

            // Skip system folders (case-insensitive)
            if (systemFolders.some(sysFolder => folderName === sysFolder.toLowerCase())) {
                console.log('🚫 Filtering out system folder:', folder.name);
                return false;
            }

            // Skip hidden files/folders
            if (folder.name.startsWith('.')) {
                console.log('🚫 Filtering out hidden item:', folder.name);
                return false;
            }

            // Skip JSON files in root (should never be projects)
            if (folder.name.endsWith('.json')) {
                console.log('🚫 Filtering out JSON file:', folder.name);
                return false;
            }

            // Skip any file-like items (projects should be folders)
            if (folder.name.includes('.') && !folder.name.includes('-') && !folder.name.includes('_')) {
                console.log('🚫 Filtering out file-like item:', folder.name);
                return false;
            }

            // Skip common non-project names
            const nonProjectNames = ['document', 'documents', 'temp', 'tmp', 'test', 'backup'];
            if (nonProjectNames.some(name => folderName.includes(name))) {
                console.log('🚫 Filtering out non-project folder:', folder.name);
                return false;
            }

            console.log('✅ Including project folder:', folder.name);
            return true;
        });

        console.log(`📁 Found ${projectFolders.length} project folders after enhanced filtering`);

        // Download and parse each project's metadata with validation
        const projectPromises = projectFolders.map(async (folder) => {
            try {
                const { data: fileData, error: downloadError } = await configSupabase.storage
                    .from(SUPABASE_CONFIG.bucket)
                    .download(`${folder.name}/project.json`);

                if (!downloadError && fileData) {
                    const projectText = await fileData.text();
                    const project = JSON.parse(projectText);

                    // Additional validation - ensure project has required fields and isn't a system item
                    if (project.title && project.key &&
                        !project.title.toLowerCase().includes('document') &&
                        !project.title.toLowerCase().includes('json') &&
                        !project.key.toLowerCase().includes('document') &&
                        !project.key.toLowerCase().includes('json') &&
                        !project.key.endsWith('.json')) {

                        console.log('✅ Loaded valid project:', project.title);
                        return project;
                    } else {
                        console.log('🚫 Skipping invalid/system project:', project.title || folder.name);
                        return null;
                    }
                } else {
                    console.log('⚠️ No project.json found in folder:', folder.name);
                    return null;
                }
            } catch (parseError) {
                console.warn('⚠️ Failed to parse project in folder:', folder.name, parseError.message);
                return null;
            }
        });

        const projectsResults = await Promise.all(projectPromises);
        const projects = projectsResults.filter(p => p !== null);

        console.log(`✅ Loaded ${projects.length} valid projects from portfolio bucket`);
        return { success: true, data: projects };

    } catch (error) {
        console.error('❌ Public project loading failed:', error.message);
        return { success: false, error: error.message };
    }
}

// ========================================
// OPTIMIZED MANIFEST-BASED LOADING
// ========================================
// Load all projects from a single manifest file for maximum speed

const PROJECTS_CACHE = {
    data: null,
    timestamp: null,
    maxAge: 5 * 60 * 1000 // 5 minutes cache
};

// Ultra-fast project loading using manifest (single API call)
async function getProjectsFast() {
    try {
        // Check memory cache first
        if (PROJECTS_CACHE.data && PROJECTS_CACHE.timestamp) {
            const age = Date.now() - PROJECTS_CACHE.timestamp;
            if (age < PROJECTS_CACHE.maxAge) {
                console.log('⚡ Projects loaded from memory cache');
                return { success: true, data: PROJECTS_CACHE.data, fromCache: true };
            }
        }

        // Check localStorage cache
        const cachedData = localStorage.getItem('projects_cache');
        if (cachedData) {
            try {
                const cached = JSON.parse(cachedData);
                if (cached.timestamp && (Date.now() - cached.timestamp) < PROJECTS_CACHE.maxAge) {
                    PROJECTS_CACHE.data = cached.data;
                    PROJECTS_CACHE.timestamp = cached.timestamp;
                    console.log('⚡ Projects loaded from localStorage cache');
                    return { success: true, data: cached.data, fromCache: true };
                }
            } catch (e) { }
        }

        if (!configSupabase) {
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }

        console.log('🚀 Loading projects via manifest...');

        // Try manifest first (single API call)
        try {
            const { data: manifestData, error: manifestError } = await configSupabase.storage
                .from(SUPABASE_CONFIG.bucket)
                .download('projects-manifest.json');

            if (!manifestError && manifestData) {
                const manifestText = await manifestData.text();
                const manifest = JSON.parse(manifestText);

                if (manifest.projects && manifest.projects.length > 0) {
                    // Update cache
                    PROJECTS_CACHE.data = manifest.projects;
                    PROJECTS_CACHE.timestamp = Date.now();
                    localStorage.setItem('projects_cache', JSON.stringify({
                        data: manifest.projects,
                        timestamp: Date.now()
                    }));

                    console.log(`⚡ Loaded ${manifest.projects.length} projects from manifest`);
                    return { success: true, data: manifest.projects };
                }
            }
        } catch (manifestErr) {
            console.log('ℹ️ No manifest found, falling back to folder scan');
        }

        // Fallback to N+1 loading (slower)
        const result = await getProjectsPublic();

        if (result.success && result.data) {
            // Update cache
            PROJECTS_CACHE.data = result.data;
            PROJECTS_CACHE.timestamp = Date.now();
            localStorage.setItem('projects_cache', JSON.stringify({
                data: result.data,
                timestamp: Date.now()
            }));
        }

        return result;

    } catch (error) {
        console.error('❌ Fast project loading failed:', error.message);

        // Try localStorage fallback
        const localProjects = localStorage.getItem('projects');
        if (localProjects) {
            const projects = JSON.parse(localProjects);
            return { success: true, data: projects, fromFallback: true };
        }

        return { success: false, error: error.message };
    }
}

// Generate manifest file for admin use (call after project changes)
async function generateProjectsManifest() {
    try {
        if (!configSupabase) {
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }

        console.log('📝 Generating projects manifest...');

        // Get all projects using the existing function
        const result = await getProjectsPublic();

        if (!result.success || !result.data) {
            throw new Error('Failed to fetch projects for manifest');
        }

        const manifest = {
            generated: new Date().toISOString(),
            count: result.data.length,
            projects: result.data
        };

        // Upload manifest
        const { error: uploadError } = await configSupabase.storage
            .from(SUPABASE_CONFIG.bucket)
            .upload('projects-manifest.json', JSON.stringify(manifest, null, 2), {
                contentType: 'application/json',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // Clear caches so next load uses new manifest
        PROJECTS_CACHE.data = null;
        PROJECTS_CACHE.timestamp = null;
        localStorage.removeItem('projects_cache');

        console.log(`✅ Manifest generated with ${result.data.length} projects`);
        return { success: true, count: result.data.length };

    } catch (error) {
        console.error('❌ Manifest generation failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Fast public content loading (no auth required) - Updated for single bucket
async function getWebsiteContentPublic() {
    try {
        if (!configSupabase) {
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }

        console.log('🚀 Loading website content from portfolio bucket...');

        const contentPath = `${SUPABASE_CONFIG.globalSettings.folder}/${SUPABASE_CONFIG.globalSettings.files.content}`;

        const { data: fileData, error } = await configSupabase.storage
            .from(SUPABASE_CONFIG.bucket)
            .download(contentPath);

        if (error) {
            console.log('ℹ️ No website content found in portfolio bucket, using defaults');
            return { success: false, error: error.message };
        }

        const contentText = await fileData.text();
        const content = JSON.parse(contentText);

        console.log('✅ Website content loaded from portfolio bucket');
        return { success: true, data: content };

    } catch (error) {
        console.error('❌ Public content loading failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Fast public team info loading (no auth required) - Updated for single bucket
async function getTeamInfoPublic() {
    try {
        if (!configSupabase) {
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }

        console.log('🚀 Loading team info from portfolio bucket...');

        const teamPath = `${SUPABASE_CONFIG.globalSettings.folder}/${SUPABASE_CONFIG.globalSettings.files.team}`;

        const { data: fileData, error } = await configSupabase.storage
            .from(SUPABASE_CONFIG.bucket)
            .download(teamPath);

        if (error) {
            console.log('ℹ️ No team info found in portfolio bucket, using defaults');
            return { success: false, error: error.message };
        }

        const teamText = await fileData.text();
        const team = JSON.parse(teamText);

        console.log('✅ Team info loaded from portfolio bucket');
        return { success: true, data: team };

    } catch (error) {
        console.error('❌ Public team info loading failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Sync portfolio bucket projects to database
async function syncPortfolioToDatabase() {
    try {
        console.log('🔄 Syncing portfolio bucket projects to database...');

        // List all project folders in portfolio bucket
        const { data: folders, error: listError } = await configSupabase.storage
            .from(SUPABASE_CONFIG.bucket)
            .list('', { limit: 100 });

        if (listError) throw listError;

        // Filter out system folders and get only project folders
        const systemFolders = [
            SUPABASE_CONFIG.websiteAssets.folder,    // 'website-assets'
            SUPABASE_CONFIG.globalSettings.folder,   // 'website-config'
            'logo',                                   // legacy logo folder
            'banner',                                 // legacy banner folder
            '.emptyFolderPlaceholder'
        ];

        const projectFolders = folders.filter(folder => {
            // Skip system folders
            if (systemFolders.includes(folder.name)) {
                console.log('🚫 Sync: Filtering out system folder:', folder.name);
                return false;
            }

            // Skip hidden files/folders
            if (folder.name.startsWith('.')) {
                console.log('🚫 Sync: Filtering out hidden item:', folder.name);
                return false;
            }

            // Skip JSON files in root
            if (folder.name.endsWith('.json')) {
                console.log('🚫 Sync: Filtering out JSON file:', folder.name);
                return false;
            }

            console.log('✅ Sync: Including project folder:', folder.name);
            return true;
        });

        const syncedProjects = [];

        for (const folder of projectFolders) {
            try {
                // Download project metadata
                const metadataPath = `${folder.name}/${SUPABASE_CONFIG.projectStructure.metadata}`;
                const { data: fileData, error: downloadError } = await configSupabase.storage
                    .from(SUPABASE_CONFIG.bucket)
                    .download(metadataPath);

                if (downloadError) {
                    console.warn('⚠️ No metadata found for:', folder.name);
                    continue;
                }

                const text = await fileData.text();
                const project = JSON.parse(text);

                // Check if project already exists in database
                const { data: existingProject } = await configSupabase
                    .from('projects')
                    .select('id')
                    .eq('key', project.key)
                    .single();

                if (!existingProject) {
                    // Insert project into database
                    const { data: newProject, error: insertError } = await configSupabase
                        .from('projects')
                        .insert([{
                            title: project.title,
                            key: project.key,
                            category: project.category,
                            description: project.description,
                            count: project.count || 1,
                            thumbnail_url: project.thumbnail_url || null
                        }])
                        .select()
                        .single();

                    if (!insertError && newProject) {
                        console.log('✅ Synced project to database:', project.title);
                        syncedProjects.push(newProject);
                    }
                }
            } catch (parseError) {
                console.warn('⚠️ Failed to sync project:', folder.name, parseError);
            }
        }

        console.log(`✅ Synced ${syncedProjects.length} projects to database`);

        // Return all projects from database after sync
        const { data: allProjects } = await configSupabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        return { success: true, data: allProjects || [] };

    } catch (error) {
        console.error('❌ Portfolio sync failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Make all functions available globally
if (typeof window !== 'undefined') {
    // Authentication functions
    window.signInAdmin = signInAdmin;
    window.signOutAdmin = signOutAdmin;
    window.getCurrentUser = getCurrentUser;
    window.testPortfolioBucketAccess = testPortfolioBucketAccess;

    // CRUD functions
    window.createProject = createProject;
    window.getProjects = getProjects;
    window.getProjectByKey = getProjectByKey;
    window.updateProject = updateProject;
    window.deleteProjectMetadata = deleteProjectMetadata;

    // Public access functions
    window.getProjectsPublic = getProjectsPublic;
    window.getWebsiteContentPublic = getWebsiteContentPublic;
    window.getTeamInfoPublic = getTeamInfoPublic;

    // Fast/optimized loading functions
    window.getProjectsFast = getProjectsFast;
    window.generateProjectsManifest = generateProjectsManifest;

    // Utility functions
    window.syncPortfolioToDatabase = syncPortfolioToDatabase;
    window.saveWebsiteContent = saveWebsiteContent;
    window.saveTeamInfo = saveTeamInfo;

    // Configuration
    window.SUPABASE_CONFIG = SUPABASE_CONFIG;
    window.initializeSupabase = initializeSupabase;
}

// Save website content to portfolio bucket
async function saveWebsiteContent(contentData) {
    try {
        if (!configSupabase) {
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }

        const contentPath = `${SUPABASE_CONFIG.globalSettings.folder}/${SUPABASE_CONFIG.globalSettings.files.content}`;

        const { data, error } = await configSupabase.storage
            .from(SUPABASE_CONFIG.bucket)
            .upload(contentPath, JSON.stringify(contentData, null, 2), {
                contentType: 'application/json',
                upsert: true
            });

        if (error) throw error;

        console.log('✅ Website content saved to portfolio bucket');
        return { success: true, data };

    } catch (error) {
        console.error('❌ Save website content failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Save team info to portfolio bucket
async function saveTeamInfo(teamData) {
    try {
        if (!configSupabase) {
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }

        const teamPath = `${SUPABASE_CONFIG.globalSettings.folder}/${SUPABASE_CONFIG.globalSettings.files.team}`;

        const { data, error } = await configSupabase.storage
            .from(SUPABASE_CONFIG.bucket)
            .upload(teamPath, JSON.stringify(teamData, null, 2), {
                contentType: 'application/json',
                upsert: true
            });

        if (error) throw error;

        console.log('✅ Team info saved to portfolio bucket');
        return { success: true, data };

    } catch (error) {
        console.error('❌ Save team info failed:', error.message);
        return { success: false, error: error.message };
    }
}
