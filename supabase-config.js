// Supabase Configuration for Extoll Portfolio
// Replace these with your actual Supabase project credentials

const SUPABASE_CONFIG = {
    url: 'https://lvtkoryorwzknxzfpyzz.supabase.co', // Your Supabase URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2dGtvcnlvcnd6a254emZweXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTAyODEsImV4cCI6MjA4MzM4NjI4MX0.eMZNHWpzSU-fSUFohCJLYuTzbqv9Yu3fY_BOLqa5ixs', // Your Supabase anon key
    
    // Admin credentials for authentication
    adminEmail: 'rkachal2k4@gmail.com', // Your admin email
    adminPassword: 'Ritesh12@', // Your admin password
    
    // Storage bucket configuration - Single bucket with structured folders
    bucket: 'extoll-portfolio', // Main bucket name (public)
    metadataBucket: 'extoll-metadata', // Metadata bucket (now public for better performance)
    folders: {
        thumbnail: 'thumbnail',
        images: 'images', 
        videos: 'videos'
    },
    // Website assets folder (not project-specific)
    websiteAssets: {
        folder: 'website-assets',
        subfolders: {
            logo: 'logo',
            banner: 'banner',
            icons: 'icons'
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
async function signInAdmin() {
    try {
        console.log('🔐 Attempting to sign in with:', SUPABASE_CONFIG.adminEmail);
        
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
            email: SUPABASE_CONFIG.adminEmail,
            password: SUPABASE_CONFIG.adminPassword
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

// Function to test metadata bucket access
async function testMetadataBucketAccess() {
    try {
        console.log('🧪 Testing metadata bucket access...');
        
        // Ensure Supabase is initialized first
        if (!configSupabase) {
            console.log('🔧 Initializing Supabase client for bucket test...');
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }
        
        // Try to list files in metadata bucket
        const { data, error } = await configSupabase.storage
            .from(SUPABASE_CONFIG.metadataBucket)
            .list('projects', { limit: 1 });
        
        if (error) {
            console.error('❌ Metadata bucket access failed:', error.message);
            
            if (error.message.includes('not found')) {
                console.error('💡 Solution: Create the extoll-metadata bucket in Supabase Storage');
            } else if (error.message.includes('access denied') || error.message.includes('unauthorized')) {
                console.error('💡 Solution: Check bucket policies and authentication');
            }
            
            return { success: false, error: error.message };
        }
        
        console.log('✅ Metadata bucket access successful');
        return { success: true, data };
    } catch (error) {
        console.error('❌ Metadata bucket test failed:', error.message);
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
        
        // Add timestamp and ID
        const projectWithMeta = {
            ...projectData,
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
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
        
        // Also save to metadata bucket (for admin panel compatibility)
        try {
            const metadataFileName = `projects/${projectData.key}.json`;
            
            const { data, error } = await configSupabase.storage
                .from(SUPABASE_CONFIG.metadataBucket)
                .upload(metadataFileName, JSON.stringify(projectWithMeta, null, 2), {
                    contentType: 'application/json',
                    upsert: true // Allow overwriting if exists
                });
            
            if (error) {
                console.warn('⚠️ Failed to save to metadata bucket:', error.message);
            } else {
                console.log('✅ Project metadata also stored in bucket');
            }
        } catch (metadataError) {
            console.warn('⚠️ Metadata bucket save failed:', metadataError.message);
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
            
            if (!dbError && dbProjects && dbProjects.length > 0) {
                console.log('✅ Projects fetched from database:', dbProjects.length);
                return { success: true, data: dbProjects };
            }
        } catch (dbError) {
            console.log('⚠️ Database access failed, trying metadata bucket:', dbError.message);
        }
        
        // Fallback to metadata bucket (requires authentication)
        try {
            // List all project metadata files
            const { data: files, error: listError } = await configSupabase.storage
                .from(SUPABASE_CONFIG.metadataBucket)
                .list('projects', {
                    limit: 100,
                    sortBy: { column: 'created_at', order: 'desc' }
                });
            
            if (listError) throw listError;
            
            if (!files || files.length === 0) {
                console.log('📭 No project metadata files found');
                return { success: true, data: [] };
            }
            
            // Download and parse each metadata file
            const projects = [];
            for (const file of files) {
                if (file.name.endsWith('.json')) {
                    try {
                        const { data: fileData, error: downloadError } = await configSupabase.storage
                            .from(SUPABASE_CONFIG.metadataBucket)
                            .download(`projects/${file.name}`);
                        
                        if (downloadError) {
                            console.warn('⚠️ Failed to download:', file.name, downloadError);
                            continue;
                        }
                        
                        const text = await fileData.text();
                        const project = JSON.parse(text);
                        projects.push(project);
                    } catch (parseError) {
                        console.warn('⚠️ Failed to parse:', file.name, parseError);
                    }
                }
            }
            
            // Sort by created_at descending
            projects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            
            console.log('✅ Projects fetched from metadata bucket:', projects.length);
            return { success: true, data: projects };
        } catch (metadataError) {
            console.log('⚠️ Metadata bucket access failed:', metadataError.message);
        }
        
        // Final fallback to localStorage
        console.log('📦 Falling back to localStorage...');
        const localProjects = JSON.parse(localStorage.getItem('projects') || '[]');
        return { success: true, data: localProjects };
        
    } catch (error) {
        console.error('❌ Get projects failed:', error.message);
        // Return empty array instead of error for public users
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
            console.log('⚠️ Database access failed, trying metadata bucket:', dbError.message);
        }
        
        // Fallback to metadata bucket (requires authentication)
        try {
            const metadataFileName = `projects/${key}.json`;
            
            const { data: fileData, error } = await configSupabase.storage
                .from(SUPABASE_CONFIG.metadataBucket)
                .download(metadataFileName);
            
            if (error) throw error;
            
            const text = await fileData.text();
            const project = JSON.parse(text);
            
            console.log('✅ Project fetched from metadata bucket by key:', project);
            return { success: true, data: project };
        } catch (metadataError) {
            console.log('⚠️ Metadata bucket access failed:', metadataError.message);
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
        
        const metadataFileName = `projects/${projectKey}.json`;
        
        // Delete metadata file from private bucket
        const { data, error } = await configSupabase.storage
            .from(SUPABASE_CONFIG.metadataBucket)
            .remove([metadataFileName]);
        
        if (error) throw error;
        
        console.log('✅ Project metadata deleted from bucket:', projectKey);
        return { success: true, data };
    } catch (error) {
        console.error('❌ Delete project failed:', error.message);
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
        
        // Also update metadata bucket (for admin panel compatibility)
        try {
            const metadataFileName = `projects/${projectKey}.json`;
            
            const { data, error } = await configSupabase.storage
                .from(SUPABASE_CONFIG.metadataBucket)
                .upload(metadataFileName, JSON.stringify(projectWithMeta, null, 2), {
                    contentType: 'application/json',
                    upsert: true // Allow overwriting
                });
            
            if (error) {
                console.warn('⚠️ Failed to update metadata bucket:', error.message);
            } else {
                console.log('✅ Project metadata also updated in bucket');
            }
        } catch (metadataError) {
            console.warn('⚠️ Metadata bucket update failed:', metadataError.message);
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

// Fast public project loading (no auth required)
async function getProjectsPublic() {
    try {
        if (!configSupabase) {
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }
        
        console.log('🚀 Loading projects from public metadata bucket...');
        
        // List all project files in metadata bucket
        const { data: files, error: listError } = await configSupabase.storage
            .from(SUPABASE_CONFIG.metadataBucket)
            .list('projects');
        
        if (listError) {
            console.error('❌ Failed to list project files:', listError.message);
            return { success: false, error: listError.message };
        }
        
        if (!files || files.length === 0) {
            console.log('📁 No project files found in metadata bucket');
            return { success: true, data: [] };
        }
        
        // Download and parse each project file
        const projects = [];
        for (const file of files) {
            if (file.name.endsWith('.json')) {
                try {
                    const { data: fileData, error: downloadError } = await configSupabase.storage
                        .from(SUPABASE_CONFIG.metadataBucket)
                        .download(`projects/${file.name}`);
                    
                    if (!downloadError && fileData) {
                        const projectText = await fileData.text();
                        const project = JSON.parse(projectText);
                        projects.push(project);
                    }
                } catch (parseError) {
                    console.warn('⚠️ Failed to parse project file:', file.name, parseError.message);
                }
            }
        }
        
        console.log(`✅ Loaded ${projects.length} projects from public metadata bucket`);
        return { success: true, data: projects };
        
    } catch (error) {
        console.error('❌ Public project loading failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Fast public content loading (no auth required)
async function getWebsiteContentPublic() {
    try {
        if (!configSupabase) {
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }
        
        console.log('🚀 Loading website content from public metadata bucket...');
        
        const { data: fileData, error } = await configSupabase.storage
            .from(SUPABASE_CONFIG.metadataBucket)
            .download('website-content.json');
        
        if (error) {
            console.log('ℹ️ No website content found in metadata bucket, using defaults');
            return { success: false, error: error.message };
        }
        
        const contentText = await fileData.text();
        const content = JSON.parse(contentText);
        
        console.log('✅ Website content loaded from public metadata bucket');
        return { success: true, data: content };
        
    } catch (error) {
        console.error('❌ Public content loading failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Fast public team info loading (no auth required)
async function getTeamInfoPublic() {
    try {
        if (!configSupabase) {
            if (!initializeSupabase()) {
                throw new Error('Failed to initialize Supabase client');
            }
        }
        
        console.log('🚀 Loading team info from public metadata bucket...');
        
        const { data: fileData, error } = await configSupabase.storage
            .from(SUPABASE_CONFIG.metadataBucket)
            .download('team-info.json');
        
        if (error) {
            console.log('ℹ️ No team info found in metadata bucket, using defaults');
            return { success: false, error: error.message };
        }
        
        const teamText = await fileData.text();
        const team = JSON.parse(teamText);
        
        console.log('✅ Team info loaded from public metadata bucket');
        return { success: true, data: team };
        
    } catch (error) {
        console.error('❌ Public team info loading failed:', error.message);
        return { success: false, error: error.message };
    }
}

// Make optimized functions available globally
if (typeof window !== 'undefined') {
    window.getProjectsPublic = getProjectsPublic;
    window.getWebsiteContentPublic = getWebsiteContentPublic;
    window.getTeamInfoPublic = getTeamInfoPublic;
}