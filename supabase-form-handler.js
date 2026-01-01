// Supabase Form Handler
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://lnxvkbsbwymmzkyuixgd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxueHZrYnNid3ltbXpreXVpeGdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDQ1MjcsImV4cCI6MjA4MjQyMDUyN30.GRi__52bgNKWhi2cpEAukKmSYjof5yqPohGYIa3cqK4'
const supabase = createClient(supabaseUrl, supabaseKey)

class SupabaseFormHandler {
    
    // Submit contact form to Supabase
    async submitContactForm(formData, source = 'contact_page') {
        try {
            // Get additional metadata
            const metadata = await this.getSubmissionMetadata()
            
            const submission = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                message: formData.message,
                source: source,
                ip_address: metadata.ip,
                user_agent: navigator.userAgent,
                referrer: document.referrer || null
            }
            
            console.log('Submitting to Supabase:', submission)
            
            const { data, error } = await supabase
                .from('contact_submissions')
                .insert([submission])
                .select()
            
            if (error) {
                console.error('Supabase error:', error)
                throw error
            }
            
            console.log('Form submitted successfully:', data)
            return {
                success: true,
                data: data[0],
                message: 'Form submitted successfully!'
            }
            
        } catch (error) {
            console.error('Error submitting form:', error)
            return {
                success: false,
                error: error.message,
                message: 'Failed to submit form. Please try again.'
            }
        }
    }
    
    // Get all contact submissions (for admin use)
    async getContactSubmissions(limit = 50, status = null) {
        try {
            let query = supabase
                .from('contact_submissions')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit)
            
            if (status) {
                query = query.eq('status', status)
            }
            
            const { data, error } = await query
            
            if (error) throw error
            return data
            
        } catch (error) {
            console.error('Error fetching submissions:', error)
            return []
        }
    }
    
    // Update submission status (for admin use)
    async updateSubmissionStatus(id, status, notes = null) {
        try {
            const updateData = { status }
            if (notes) updateData.admin_notes = notes
            
            const { data, error } = await supabase
                .from('contact_submissions')
                .update(updateData)
                .eq('id', id)
                .select()
            
            if (error) throw error
            return data[0]
            
        } catch (error) {
            console.error('Error updating submission:', error)
            return null
        }
    }
    
    // Get submission statistics
    async getSubmissionStats() {
        try {
            const { data, error } = await supabase
                .from('contact_submissions')
                .select('status, created_at, source')
            
            if (error) throw error
            
            const stats = {
                total: data.length,
                new: data.filter(s => s.status === 'new').length,
                replied: data.filter(s => s.status === 'replied').length,
                closed: data.filter(s => s.status === 'closed').length,
                bySource: this.groupBySource(data),
                recentSubmissions: data
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 5)
            }
            
            return stats
            
        } catch (error) {
            console.error('Error getting stats:', error)
            return null
        }
    }
    
    // Helper functions
    async getSubmissionMetadata() {
        try {
            const ipResponse = await fetch('https://api.ipify.org?format=json')
            const ipData = await ipResponse.json()
            return {
                ip: ipData.ip,
                timestamp: new Date().toISOString()
            }
        } catch (error) {
            return {
                ip: 'unknown',
                timestamp: new Date().toISOString()
            }
        }
    }
    
    groupBySource(data) {
        const sourceCount = {}
        data.forEach(submission => {
            sourceCount[submission.source] = (sourceCount[submission.source] || 0) + 1
        })
        return sourceCount
    }
    
    // Validate form data
    validateFormData(formData) {
        const errors = []
        
        if (!formData.name || formData.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long')
        }
        
        if (!formData.email || !this.isValidEmail(formData.email)) {
            errors.push('Please enter a valid email address')
        }
        
        if (!formData.message || formData.message.trim().length < 10) {
            errors.push('Message must be at least 10 characters long')
        }
        
        if (formData.phone && !this.isValidPhone(formData.phone)) {
            errors.push('Please enter a valid phone number')
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        }
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }
    
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
    }
}

// Initialize form handler
const formHandler = new SupabaseFormHandler()

// Export for use in other files
window.SupabaseFormHandler = formHandler

export default formHandler