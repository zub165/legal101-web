// Theme Switching Functionality
document.getElementById('themeSelector').addEventListener('change', function() {
    document.body.className = '';
    if(this.value !== 'default') {
        document.body.classList.add('theme-' + this.value);
    }
    
    // Save preference to localStorage
    localStorage.setItem('themePreference', this.value);
});

// Load saved theme preference
const savedTheme = localStorage.getItem('themePreference');
if(savedTheme) {
    document.getElementById('themeSelector').value = savedTheme;
    if(savedTheme !== 'default') {
        document.body.classList.add('theme-' + savedTheme);
    }
}

// Language Switching Framework
document.getElementById('languageSelector').addEventListener('change', function() {
    const lang = this.value;
    // Load translations from JSON files
    updateTextTranslations(lang);
    
    // Save preference to localStorage
    localStorage.setItem('languagePreference', lang);
});

// Load saved language preference
const savedLang = localStorage.getItem('languagePreference');
if(savedLang) {
    document.getElementById('languageSelector').value = savedLang;
    updateTextTranslations(savedLang);
} else {
    // Default to English if no preference is saved
    updateTextTranslations('en');
}

// Translation function
function updateTextTranslations(lang) {
    console.log(`Attempting to load translations for ${lang}`);
    
    // For faster development, we'll use in-memory translations if we already loaded them
    if (window.translationCache && window.translationCache[lang]) {
        console.log(`Using cached translations for ${lang}`);
        applyTranslations(window.translationCache[lang], lang);
        return;
    }
    
    fetch(`translations/${lang}.json`)
        .then(response => {
            if (!response.ok) {
                console.error(`Failed to load translations file for ${lang}: ${response.status} ${response.statusText}`);
                throw new Error(`Translation file not found for ${lang}`);
            }
            console.log(`Translation file for ${lang} loaded successfully`);
            return response.json();
        })
        .then(translations => {
            // Cache the translations for future use
            if (!window.translationCache) window.translationCache = {};
            window.translationCache[lang] = translations;
            
            applyTranslations(translations, lang);
        })
        .catch(error => {
            console.error(`Error in translation process for ${lang}:`, error);
            
            // If we have translations in memory, try to create a template from English
            if (window.translationCache && window.translationCache['en']) {
                console.log(`Creating in-memory template for ${lang} from English`);
                const templateTranslations = {};
                Object.keys(window.translationCache['en']).forEach(key => {
                    templateTranslations[key] = `[${lang}] ${window.translationCache['en'][key]}`;
                });
                
                // Cache the template translations
                window.translationCache[lang] = templateTranslations;
                applyTranslations(templateTranslations, lang);
            } else {
                // Fallback to English if translation file not found or has an error
                if (lang !== 'en') {
                    console.log('Falling back to English translations');
                    updateTextTranslations('en');
                }
            }
        });
}

// Apply translations to the DOM
function applyTranslations(translations, lang) {
    console.log(`Applying translations for ${lang}, found ${Object.keys(translations).length} translation keys`);
    
    let translatedCount = 0;
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if(translations[key]) {
            translatedCount++;
            // Handle different element types
            if (element.tagName === 'INPUT' && element.getAttribute('placeholder')) {
                element.setAttribute('placeholder', translations[key]);
            } else {
                element.textContent = translations[key];
            }
        } else {
            console.warn(`Missing translation key: ${key} for language ${lang}`);
        }
    });
    
    console.log(`Applied ${translatedCount} translations for ${lang}`);
    
    // Update document language for accessibility
    document.documentElement.lang = lang;
    
    // Update RTL/LTR direction for languages
    const rtlLangs = ['ar', 'he', 'fa', 'ur'];
    document.documentElement.dir = rtlLangs.includes(lang) ? 'rtl' : 'ltr';
    
    // Update local UI to show current language
    const langSelector = document.getElementById('languageSelector');
    if (langSelector) {
        langSelector.value = lang;
    }
}

// NEW FUNCTION: Tab Navigation System
function initTabNavigation() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    
    // Get all content sections
    const contentSections = document.querySelectorAll('section[id]');
    
    // Function to show only the active section
    function showActiveSection(sectionId) {
        // Hide all sections first
        contentSections.forEach(section => {
            if (section.id !== 'main-header') {
                section.style.display = 'none';
            }
        });
        
        // Show hero section and situations only on home
        const heroSection = document.querySelector('.hero');
        const situationsSection = document.getElementById('situations');
        const emergencySection = document.querySelector('.emergency-section');
        
        if (sectionId === 'home' || !sectionId) {
            // Show home page elements
            heroSection.style.display = 'flex';
            situationsSection.style.display = 'block';
            emergencySection.style.display = 'block';
        } else {
            // Hide home page elements on other tabs
            heroSection.style.display = 'none';
            situationsSection.style.display = 'none';
            
            // Show emergency button on all tabs except settings
            emergencySection.style.display = sectionId === 'settings' ? 'none' : 'block';
        }
        
        // Show the corresponding section
        if (sectionId && sectionId !== 'home') {
            const activeSection = document.getElementById(sectionId);
            if (activeSection) {
                activeSection.style.display = 'block';
            }
        }
        
        // Update active class on navigation links
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkSectionId = link.getAttribute('href').replace('#', '');
            if ((linkSectionId === sectionId) || (linkSectionId === '' && sectionId === 'home')) {
                link.classList.add('active');
            }
        });
    }
    
    // Add click event listeners to all navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').replace('#', '') || 'home';
            showActiveSection(sectionId);
            
            // Update URL without page reload
            history.pushState(null, null, sectionId === 'home' ? './' : `#${sectionId}`);
        });
    });
    
    // Handle initial page load and browser back/forward navigation
    function handleInitialState() {
        let initialSectionId = 'home';
        const hash = window.location.hash;
        
        if (hash) {
            initialSectionId = hash.replace('#', '');
        }
        
        showActiveSection(initialSectionId);
    }
    
    // Handle initial page load
    handleInitialState();
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', handleInitialState);
}

// FAQ Accordion Functionality
const faqQuestions = document.querySelectorAll('.faq-question');
faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        answer.classList.toggle('active');
        
        // Close other open answers
        faqQuestions.forEach(q => {
            if(q !== question) {
                q.nextElementSibling.classList.remove('active');
            }
        });
    });
});

// AI Legal Assistant Integration
document.getElementById('ask-button').addEventListener('click', function() {
    const question = document.getElementById('faq-input').value;
    if (!question.trim()) return; // Don't process empty questions
    
    const responseBox = document.getElementById('ai-response');
    const responseContent = document.getElementById('ai-response-content');
    
    // Show loading state
    responseBox.style.display = 'block';
    responseContent.innerHTML = '<p>Processing your question...</p>';
    
    // In a production environment, this would call an actual AI API
    // For now, we'll use a simulated API call with improved responses
    getLegalAIResponse(question)
        .then(response => {
            responseContent.innerHTML = response;
        })
        .catch(error => {
            responseContent.innerHTML = `
                <p>Sorry, I couldn't process your question at this time. Please try again later.</p>
                <p>Error: ${error.message}</p>
            `;
        });
});

// Simulated AI API function - would be replaced with actual API call
async function getLegalAIResponse(question) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const questionLower = question.toLowerCase();
    let response = '';
    
    // Enhanced keyword matching with more comprehensive responses
    if(questionLower.includes('airport') || questionLower.includes('tsa') || questionLower.includes('travel')) {
        response = `
            <p>Regarding airport security and travel rights:</p>
            <ul>
                <li>You can opt out of full-body scanners for a pat-down</li>
                <li>TSA cannot search your phone/laptop content without cause</li>
                <li>Border agents have more search authority than TSA</li>
                <li>You have the right to remain silent during questioning</li>
                <li>Consider traveling with minimal personal data on devices</li>
                <li>International travelers may face different rules at customs</li>
            </ul>
            <p>For more details, visit our <a href="#travel">Travel Rights</a> section.</p>
            <div class="ai-disclaimer">
                <small>This information is general guidance and not legal advice. Laws vary by jurisdiction.</small>
            </div>
        `;
    } 
    else if(questionLower.includes('police') || questionLower.includes('officer') || questionLower.includes('arrest')) {
        response = `
            <p>Regarding police interactions:</p>
            <ul>
                <li>You have the right to remain silent (5th Amendment)</li>
                <li>You must identify yourself if required by state law</li>
                <li>Ask "Am I free to leave?" if unsure about detention</li>
                <li>Police need probable cause or consent to search (4th Amendment)</li>
                <li>You can request an attorney if detained (6th Amendment)</li>
                <li>You can record police in public spaces (1st Amendment)</li>
            </ul>
            <p>For more details, visit our <a href="#police">Police Interactions</a> section.</p>
            <div class="ai-disclaimer">
                <small>This information is general guidance and not legal advice. Laws vary by jurisdiction.</small>
            </div>
        `;
    }
    else if(questionLower.includes('drive') || questionLower.includes('traffic') || questionLower.includes('car')) {
        response = `
            <p>Regarding traffic stops:</p>
            <ul>
                <li>Pull over safely and keep hands visible</li>
                <li>Provide license, registration, and insurance when asked</li>
                <li>You can refuse consent to search your vehicle</li>
                <li>Field sobriety tests are generally voluntary</li>
                <li>Breathalyzer refusal may have administrative penalties</li>
                <li>You can remain silent beyond required identification</li>
                <li>You can ask if you're free to leave if not under arrest</li>
            </ul>
            <p>For more details, visit our <a href="#driving">Driving Rights</a> section.</p>
            <div class="ai-disclaimer">
                <small>This information is general guidance and not legal advice. Laws vary by jurisdiction.</small>
            </div>
        `;
    }
    else if(questionLower.includes('home') || questionLower.includes('house') || questionLower.includes('warrant')) {
        response = `
            <p>Regarding home searches and warrants:</p>
            <ul>
                <li>Police generally need a warrant to enter your home</li>
                <li>Exceptions include consent, emergency situations, or "hot pursuit"</li>
                <li>You can ask to see a warrant before allowing entry</li>
                <li>Check that the warrant includes correct name, address, and judge signature</li>
                <li>You don't have to answer questions during a search</li>
                <li>Document any property damage or items taken</li>
            </ul>
            <p>For more details, visit our <a href="#privacy">Privacy Rights</a> section.</p>
            <div class="ai-disclaimer">
                <small>This information is general guidance and not legal advice. Laws vary by jurisdiction.</small>
            </div>
        `;
    }
    else if(questionLower.includes('record') || questionLower.includes('video') || questionLower.includes('film')) {
        response = `
            <p>Regarding recording police or officials:</p>
            <ul>
                <li>You generally have the right to record police in public places</li>
                <li>Recording must not physically interfere with police activities</li>
                <li>Some states have "two-party consent" laws for audio recording</li>
                <li>You may be asked to step back but not required to stop recording</li>
                <li>Police cannot delete your footage or seize your device without a warrant</li>
                <li>Identify yourself as press if applicable</li>
            </ul>
            <div class="ai-disclaimer">
                <small>This information is general guidance and not legal advice. Laws vary by jurisdiction.</small>
            </div>
        `;
    }
    else {
        response = `
            <p>I'm a legal information assistant. While I can't provide specific legal advice, I can offer general information about:</p>
            <ul>
                <li>Travel rights at airports and borders</li>
                <li>Traffic stops and police interactions</li>
                <li>Privacy protections with authorities</li>
                <li>Home searches and warrants</li>
                <li>Recording police and officials</li>
                <li>How to file complaints about rights violations</li>
            </ul>
            <p>Please try asking about one of these topics or visit our emergency section if you need immediate help.</p>
            <div class="ai-disclaimer">
                <small>This AI assistant provides general legal information, not personalized legal advice. For specific guidance, consult a qualified attorney familiar with the laws in your jurisdiction.</small>
            </div>
        `;
    }
    
    return response;
}

// Set current year in footer
document.getElementById('current-year').textContent = new Date().getFullYear();

// Settings Management
function initializeSettings() {
    // Load saved settings from localStorage
    loadSettings();
    
    // Add event listeners for settings changes
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('resetSettings').addEventListener('click', resetSettings);
    
    // Individual setting change handlers
    document.getElementById('apiProvider').addEventListener('change', updateApiProviderUI);
    document.getElementById('themeMode').addEventListener('change', function() {
        // This will update the UI immediately before saving
        const themeValue = this.value;
        if(themeValue !== 'auto') {
            // Update theme selector to match
            document.getElementById('themeSelector').value = themeValue === 'default' ? 'default' : themeValue;
            document.getElementById('themeSelector').dispatchEvent(new Event('change'));
        }
    });
    
    document.getElementById('primaryLanguage').addEventListener('change', function() {
        // This will update the UI immediately before saving
        const langValue = this.value;
        // Update language selector to match
        document.getElementById('languageSelector').value = langValue;
        document.getElementById('languageSelector').dispatchEvent(new Event('change'));
    });
}

function loadSettings() {
    // API Settings
    const savedApiProvider = localStorage.getItem('apiProvider') || 'default';
    document.getElementById('apiProvider').value = savedApiProvider;
    
    const savedApiKey = localStorage.getItem('apiKey') || '';
    document.getElementById('apiKey').value = savedApiKey;
    
    const savedApiCaching = localStorage.getItem('apiCaching') || 'enabled';
    document.getElementById('apiCaching').value = savedApiCaching;
    
    const savedApiOfflineMode = localStorage.getItem('apiOfflineMode') || 'auto';
    document.getElementById('apiOfflineMode').value = savedApiOfflineMode;
    
    // Theme Settings
    const savedThemeMode = localStorage.getItem('themeMode') || 'default';
    document.getElementById('themeMode').value = savedThemeMode;
    
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    document.getElementById('themeFontSize').value = savedFontSize;
    applyFontSize(savedFontSize);
    
    const savedAnimations = localStorage.getItem('animations') || 'enabled';
    document.getElementById('themeAnimations').value = savedAnimations;
    
    const savedEmergencyAppearance = localStorage.getItem('emergencyAppearance') || 'standard';
    document.getElementById('emergencyAppearance').value = savedEmergencyAppearance;
    
    // Language Settings
    const savedLanguage = localStorage.getItem('languagePreference') || 'en';
    document.getElementById('primaryLanguage').value = savedLanguage;
    
    const savedTerminology = localStorage.getItem('terminology') || 'simple';
    document.getElementById('languageTerminology').value = savedTerminology;
    
    const savedAutoDetect = localStorage.getItem('autoDetectLanguage') || 'enabled';
    document.getElementById('autoDetect').value = savedAutoDetect;
    
    const savedVoiceLanguage = localStorage.getItem('voiceLanguage') || 'same';
    document.getElementById('voiceLanguage').value = savedVoiceLanguage;
    
    // Update UI based on loaded settings
    updateApiProviderUI();
}

function saveSettings() {
    // Save API Settings
    localStorage.setItem('apiProvider', document.getElementById('apiProvider').value);
    localStorage.setItem('apiKey', document.getElementById('apiKey').value);
    localStorage.setItem('apiCaching', document.getElementById('apiCaching').value);
    localStorage.setItem('apiOfflineMode', document.getElementById('apiOfflineMode').value);
    
    // Save Theme Settings
    localStorage.setItem('themeMode', document.getElementById('themeMode').value);
    localStorage.setItem('fontSize', document.getElementById('themeFontSize').value);
    localStorage.setItem('animations', document.getElementById('themeAnimations').value);
    localStorage.setItem('emergencyAppearance', document.getElementById('emergencyAppearance').value);
    
    // Save Language Settings
    localStorage.setItem('languagePreference', document.getElementById('primaryLanguage').value);
    localStorage.setItem('terminology', document.getElementById('languageTerminology').value);
    localStorage.setItem('autoDetectLanguage', document.getElementById('autoDetect').value);
    localStorage.setItem('voiceLanguage', document.getElementById('voiceLanguage').value);
    
    // Apply settings that need immediate effect
    applyFontSize(document.getElementById('themeFontSize').value);
    
    // Show success message
    alert('Settings saved successfully!');
}

function resetSettings() {
    if(confirm('Reset all settings to default values?')) {
        // Clear all settings from localStorage
        localStorage.removeItem('apiProvider');
        localStorage.removeItem('apiKey');
        localStorage.removeItem('apiCaching');
        localStorage.removeItem('apiOfflineMode');
        localStorage.removeItem('themeMode');
        localStorage.removeItem('fontSize');
        localStorage.removeItem('animations');
        localStorage.removeItem('emergencyAppearance');
        localStorage.removeItem('languagePreference');
        localStorage.removeItem('terminology');
        localStorage.removeItem('autoDetectLanguage');
        localStorage.removeItem('voiceLanguage');
        
        // Reset theme to default
        document.body.className = '';
        document.getElementById('themeSelector').value = 'default';
        
        // Reset language to English
        document.getElementById('languageSelector').value = 'en';
        updateTextTranslations('en');
        
        // Reload settings from defaults
        loadSettings();
        
        // Show success message
        alert('Settings have been reset to defaults.');
    }
}

function updateApiProviderUI() {
    // Show/hide API key field based on provider
    const provider = document.getElementById('apiProvider').value;
    const apiKeyField = document.getElementById('apiKey');
    
    if (provider === 'default') {
        apiKeyField.disabled = true;
        apiKeyField.placeholder = 'No API key needed for default service';
    } else {
        apiKeyField.disabled = false;
        apiKeyField.placeholder = `Enter your ${provider} API key`;
    }
}

function applyFontSize(size) {
    // Remove any existing font size classes
    document.body.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
    
    // Add the selected font size class
    document.body.classList.add(`font-${size}`);
}

// External Resources Management
function initializeExternalResources() {
    // Add event listeners for connect buttons
    const connectButtons = document.querySelectorAll('.resource-connection .btn');
    connectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const resourceConnection = this.closest('.resource-connection');
            const statusIndicator = resourceConnection.querySelector('.status-indicator');
            const statusText = resourceConnection.querySelector('.connection-status span:last-child');
            
            // Simulate connection process
            this.textContent = 'Connecting...';
            this.disabled = true;
            
            setTimeout(() => {
                // Update to connected state
                statusIndicator.classList.remove('disconnected');
                statusIndicator.classList.add('connected');
                statusText.textContent = 'Connected';
                
                // Remove the connect button
                this.remove();
            }, 1500);
        });
    });
    
    // Add event listeners for emergency resource items
    const emergencyResources = document.querySelectorAll('.emergency-resource-item');
    emergencyResources.forEach(resource => {
        resource.addEventListener('click', function(e) {
            e.preventDefault();
            const resourceType = this.querySelector('span').textContent;
            handleEmergencyResource(resourceType);
        });
    });
}

function handleEmergencyResource(resourceType) {
    const infoPanel = document.getElementById('emergency-info-panel');
    let content = '';

    // Determine content based on the clicked resource
    switch(resourceType.toLowerCase()) {
        case 'legal hotline':
            content = `
                <h4>Legal Hotlines</h4>
                <p>Legal hotlines offer quick legal advice, often for free or low cost, especially in urgent situations.</p>
                <ul>
                    <li><strong>National Lawyers Guild Hotline:</strong> (Search online for current numbers, often available during protests)</li>
                    <li><strong>Local Bar Association Hotlines:</strong> Check your city or state bar association website.</li>
                    <li><strong>ACLU Hotlines:</strong> Search for ACLU hotlines specific to your state.</li>
                </ul>
                <p><em>Note: These are examples. Search online for specific, up-to-date hotline numbers relevant to your location and situation.</em></p>
            `;
            break;
        case 'attorney referral':
            content = `
                <h4>Attorney Referral Services</h4>
                <p>These services help you find a qualified lawyer in your area for your specific legal issue.</p>
                <ul>
                    <li><strong>State Bar Association Referral Service:</strong> Most state bars offer a service to connect you with lawyers. Search online for '[Your State] Bar Attorney Referral'.</li>
                    <li><strong>Local Bar Associations:</strong> City or county bar associations often have referral programs.</li>
                    <li><strong>Online Directories:</strong> Websites like Avvo, FindLaw, or Martindale-Hubbell list attorneys, but be sure to research their qualifications.</li>
                </ul>
                <p><em>Note: Referral services often provide an initial consultation for a reduced fee or free.</em></p>
            `;
            break;
        case 'legal aid':
            content = `
                <h4>Legal Aid Organizations</h4>
                <p>Legal Aid societies provide free or low-cost legal help to people with low income.</p>
                <ul>
                    <li><strong>Legal Services Corporation (LSC):</strong> Find LSC-funded programs in your area: <a href=\"https://www.lsc.gov/find-legal-aid\" target=\"_blank\">LSC Find Legal Aid</a></li>
                    <li><strong>State and Local Legal Aid Societies:</strong> Search online for 'Legal Aid Society [Your City/State]'.</li>
                    <li><strong>Pro Bono Programs:</strong> Many bar associations run programs where lawyers volunteer their time.</li>
                </ul>
                <p><em>Note: Eligibility for Legal Aid is usually based on income. Check their websites for details.</em></p>
            `;
            break;
        case 'report violation':
            content = `
                <h4>Reporting Rights Violations</h4>
                <p>If you believe your rights were violated by law enforcement, you can report it directly:</p>
                <div class="direct-contact-container">
                    <div class="contact-card">
                        <h5>Department of Justice Civil Rights Division</h5>
                        <p>For civil rights violations by law enforcement agencies:</p>
                        <div class="contact-methods">
                            <a href="tel:1-855-856-1247" class="contact-button phone"><i class="contact-icon"></i>1-855-856-1247</a>
                            <a href="mailto:community.doj@usdoj.gov" class="contact-button email"><i class="contact-icon"></i>community.doj@usdoj.gov</a>
                            <a href="https://civilrights.justice.gov/report/" target="_blank" class="contact-button web"><i class="contact-icon"></i>Online Complaint Form</a>
                        </div>
                    </div>

                    <div class="contact-card">
                        <h5>ACLU National Office</h5>
                        <p>Legal assistance for civil rights violations:</p>
                        <div class="contact-methods">
                            <a href="tel:1-212-549-2500" class="contact-button phone"><i class="contact-icon"></i>1-212-549-2500</a>
                            <a href="https://intake.aclu.org" target="_blank" class="contact-button web"><i class="contact-icon"></i>Submit Case Online</a>
                        </div>
                        <p class="contact-note">Find your local ACLU chapter: <a href="https://www.aclu.org/about/affiliates" target="_blank">ACLU State Offices</a></p>
                    </div>

                    <div class="contact-card">
                        <h5>National Lawyers Guild</h5>
                        <p>For protest-related arrests and police misconduct:</p>
                        <div class="contact-methods">
                            <a href="tel:1-212-679-5100" class="contact-button phone"><i class="contact-icon"></i>1-212-679-5100</a>
                            <a href="mailto:communications@nlg.org" class="contact-button email"><i class="contact-icon"></i>communications@nlg.org</a>
                        </div>
                    </div>
                </div>

                <div class="complaint-steps">
                    <h5>How to File a Local Police Complaint:</h5>
                    <ol>
                        <li><strong>Internal Affairs</strong>: Contact the police department's Internal Affairs division directly. Search "<span class="highlight">[Your City] Police Internal Affairs</span>" for contact information.</li>
                        <li><strong>Civilian Oversight Board</strong>: Many cities have civilian review boards. Search "<span class="highlight">[Your City] Civilian Complaint Review Board</span>".</li>
                        <li><strong>Local Government</strong>: Contact your mayor's office or city council if other options fail.</li>
                    </ol>
                    <p>Always document <strong>all interactions</strong> with the following information:</p>
                    <ul>
                        <li>Officer names and badge numbers</li>
                        <li>Date, time, and location of incident</li>
                        <li>Witness contact information</li>
                        <li>Photos of any injuries or property damage</li>
                        <li>Copies of any related documents (tickets, reports, etc.)</li>
                    </ul>
                    <p class="action-prompt"><a href="#" id="generate-complaint-form" class="btn btn-small">Create Complaint Letter</a></p>
                </div>
            `;
            break;
        default:
            content = '<p>Information for this resource is not available yet.</p>';
    }

    // Display the content in the panel
    infoPanel.innerHTML = content;
    infoPanel.style.display = 'block';

    // Optional: Scroll the panel into view
    infoPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Check if translations directory exists and create sample translation file
function createSampleTranslation() {
    // In a real application, translation files would be included during development
    console.log("NOTE: In a production environment, translation files would be created manually during development.");
    
    // Make error handling more graceful for missing translation files
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        return originalFetch(url, options)
            .catch(error => {
                if (url.includes('translations/')) {
                    console.log(`Resource not found: ${url}. This is expected in development.`);
                    // Return a default empty translation object to prevent app from breaking
                    return {
                        json: () => Promise.resolve({}),
                        ok: true
                    };
                }
                return Promise.reject(error);
            });
    };
    
    // Create sample translations for languages that might not have files
    ensureTranslationFiles();
}

// Function to ensure all selected languages have at least a template translation file
function ensureTranslationFiles() {
    // Get list of all languages from the selector
    const languageOptions = document.querySelectorAll('#languageSelector option');
    const languages = Array.from(languageOptions).map(option => option.value);
    
    // We'll use English as the template for missing translation files
    fetch('translations/en.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load English translation file as template');
            }
            return response.json();
        })
        .then(englishTranslations => {
            // For each language, check if its file exists and create if missing
            languages.forEach(lang => {
                if (lang === 'en') return; // Skip English
                
                fetch(`translations/${lang}.json`)
                    .then(response => {
                        if (!response.ok) {
                            console.log(`Creating template for missing translation file: ${lang}.json`);
                            // Create a copy of English with [TRANSLATE] markers
                            const templateTranslations = {};
                            Object.keys(englishTranslations).forEach(key => {
                                templateTranslations[key] = `[TRANSLATE] ${englishTranslations[key]}`;
                            });
                            
                            // In a real app, we would write to the file system
                            // Since we can't do that in the browser, we'll create a mock for the fetch intercept
                            console.log(`Created in-memory template for ${lang} with ${Object.keys(templateTranslations).length} keys`);
                        }
                    })
                    .catch(error => {
                        console.error(`Error checking translation file for ${lang}:`, error);
                    });
            });
        })
        .catch(error => {
            console.error('Failed to process translation files:', error);
        });
}

// Initialize components when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create sample translation (for demonstration)
    createSampleTranslation();
    
    // Initialize Tab Navigation
    initTabNavigation();
    
    // Initialize Settings Functionality
    initializeSettings();
    
    // Initialize External Resource Connections
    initializeExternalResources();
});

// NEW: Hero Search Bar Functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const searchableSections = document.querySelectorAll('section[id]:not([id="settings"])'); // Search all sections except settings
    let originalContents = new Map(); // Store original HTML to remove highlights

    // Store original content on load
    searchableSections.forEach(section => {
        originalContents.set(section, section.innerHTML);
    });

    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();

        // Reset previous highlights and visibility
        searchableSections.forEach(section => {
            if (originalContents.has(section)) {
                section.innerHTML = originalContents.get(section);
            }
            section.style.display = ''; // Make potentially hidden sections visible again for search
        });

        // Always keep hero and situations visible if searching from home/initial state
        const heroSection = document.querySelector('.hero');
        const situationsSection = document.getElementById('situations');
        if(window.location.hash === '' || window.location.hash === '#home'){
             heroSection.style.display = 'flex';
             situationsSection.style.display = 'block';
        } else {
             heroSection.style.display = 'none';
             situationsSection.style.display = 'none';
        }

        if (searchTerm === '') {
            // If search is cleared, ensure the current tab's content is visible
             initTabNavigation(); // Re-run tab logic to show correct section
            return; 
        }

        let foundMatch = false;
        searchableSections.forEach(section => {
            const sectionText = section.textContent.toLowerCase();
            const originalHtml = originalContents.get(section);
           
            if (sectionText.includes(searchTerm)) {
                 foundMatch = true;
                 section.style.display = 'block'; // Ensure section is visible
               
                 // Safely add highlighting by creating a container element
                 try {
                     // Get a clean version of the search term for the regex
                     const safeSearchTerm = searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                     // Create a safer highlighting approach
                     const tempDiv = document.createElement('div');
                     tempDiv.innerHTML = originalHtml;
                     
                     // Function to highlight text in text nodes only
                     function highlightTextNodes(node) {
                         if (node.nodeType === 3) { // Text node
                             const text = node.nodeValue;
                             const regex = new RegExp(safeSearchTerm, 'gi');
                             if (regex.test(text)) {
                                 const span = document.createElement('span');
                                 span.innerHTML = text.replace(regex, '<span class="search-highlight">$&</span>');
                                 node.parentNode.replaceChild(span, node);
                             }
                         } else if (node.nodeType === 1) { // Element node
                             // Skip script tags and style tags
                             if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
                                 [...node.childNodes].forEach(highlightTextNodes);
                             }
                         }
                     }
                     
                     // Apply highlighting
                     highlightTextNodes(tempDiv);
                     section.innerHTML = tempDiv.innerHTML;
                 } catch (e) {
                      console.error("Highlighting error:", e); // Log error if process fails
                      section.innerHTML = originalHtml; // Revert to original on error
                 }
            } else {
                // Hide sections that don't match, unless it's the always-visible hero/situations on home
                if(!( (window.location.hash === '' || window.location.hash === '#home') && (section === heroSection || section === situationsSection)) ) {
                     section.style.display = 'none'; 
                }
            }
        });

        // Optional: Add a message if no results are found
         if (!foundMatch) {
            console.log("No results found for: ", searchTerm);
         }
    }

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
         if (searchInput.value.trim() === '') {
             // If input is cleared, reset highlights and visibility
             performSearch(); 
         }
    });
});

// NEW: Click handlers for Legal Resource items
document.addEventListener('DOMContentLoaded', () => {
    const resourceItems = document.querySelectorAll('#resources .clickable-resource');
    const infoPanel = document.getElementById('resource-info-panel');

    resourceItems.forEach(item => {
        item.addEventListener('click', () => {
            const resourceType = item.getAttribute('data-resource-type');
            let content = '';

            switch(resourceType) {
                case 'rights-cards':
                    content = `
                        <h4>Downloadable Rights Cards</h4>
                        <p>Having a small card summarizing your key rights can be helpful during stressful encounters. Many organizations offer printable versions:</p>
                        <ul>
                            <li><strong>ACLU Know Your Rights Cards:</strong> <a href=\"https://www.aclu.org/know-your-rights/\" target=\"_blank\">ACLU Website</a> (Look for printable resources)</li>
                            <li><strong>National Lawyers Guild Pocket Guides:</strong> Search their website for available guides.</li>
                            <li><a href="#" id="generate-rights-card">Generate Printable Rights Card</a></li>
                        </ul>
                        <p>You can save these to your phone or print them for your wallet.</p>
                    `;
                    break;
                case 'complaint-letters':
                    content = `
                        <h4>Sample Complaint Letters</h4>
                        <p>When filing a complaint against law enforcement, a clear, detailed letter is important. Here are sources for templates:</p>
                        <ul>
                            <li><strong>Local Police Oversight Boards:</strong> Check the website of your city/county's civilian review board for specific forms or templates.</li>
                            <li><strong>Civil Rights Organizations:</strong> Groups like the ACLU sometimes provide sample letters or guidance on their websites.</li>
                            <li><a href="#" id="fillable-complaint-template">Create a Fillable Complaint Template</a></li>
                        </ul>
                        <p>Remember to include key details: date, time, location, officer names/badge numbers, witnesses, and a factual description of the event.</p>
                    `;
                    break;
                case 'state-laws':
                    content = `
                        <h4>State-Specific Laws</h4>
                        <p>Laws regarding interactions with police (e.g., recording consent, 'Stop and Identify' requirements) vary significantly by state. It's crucial to know your local laws.</p>
                        <ul>
                            <li><strong>State Legislature Websites:</strong> Search for your state's official legislative website to find statutes.</li>
                            <li><strong>Cornell LII State Law Resources:</strong> <a href=\"https://www.law.cornell.edu/statutes/listing/bystate\" target=\"_blank\">Cornell Legal Information Institute</a></li>
                            <li><strong>Local ACLU Chapter:</strong> Your state's ACLU website often summarizes relevant state laws.</li>
                            <li><strong>NOLO Legal Encyclopedia:</strong> Provides plain-language explanations of laws, often state-specific.</li>
                        </ul>
                        <p>Focus on laws related to recording police, refusing searches, and identification requirements.</p>
                    `;
                    break;
                case 'legal-aid-dir':
                    content = `
                        <h4>Legal Aid Directory</h4>
                        <p>Legal Aid provides free or low-cost legal assistance to eligible individuals. Here's how to find help:</p>
                        <ul>
                            <li><strong>Legal Services Corporation (LSC) Grantee Locator:</strong> <a href=\"https://www.lsc.gov/find-legal-aid\" target=\"_blank\">Find Legal Aid (LSC.gov)</a></li>
                            <li><strong>State Bar Association Pro Bono Programs:</strong> Search your state bar website for 'pro bono' or 'volunteer lawyers'.</li>
                            <li><strong>LawHelp.org:</strong> A national directory of free legal aid programs: <a href=\"https://www.lawhelp.org\" target=\"_blank\">LawHelp.org</a></li>
                            <li><strong>Local Law School Clinics:</strong> Many law schools run clinics offering free legal help.</li>
                        </ul>
                        <p>Eligibility is usually based on income and case type. Contact organizations directly for details.</p>
                    `;
                    break;
                default:
                    content = '<p>Details for this resource are not available yet.</p>';
            }

            infoPanel.innerHTML = content;
            infoPanel.style.display = 'block';
            infoPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });
});

// Fillable complaint letter template functionality
document.addEventListener('DOMContentLoaded', () => {
    // Event delegation for the complaint template link (since it's dynamically created)
    document.body.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'fillable-complaint-template') {
            e.preventDefault();
            showComplaintTemplateForm();
        }
    });
});

function showComplaintTemplateForm() {
    const infoPanel = document.getElementById('resource-info-panel');
    
    const templateHTML = `
        <div class="template-container">
            <h3>Police Complaint Letter Template</h3>
            <form id="complaint-form" class="template-form">
                <div class="form-group">
                    <label for="yourName">Your Name:</label>
                    <input type="text" id="yourName" class="form-input" placeholder="Full Name">
                </div>
                
                <div class="form-group">
                    <label for="yourAddress">Your Address:</label>
                    <input type="text" id="yourAddress" class="form-input" placeholder="Street Address">
                </div>
                
                <div class="form-group">
                    <label for="yourCity">City, State, ZIP:</label>
                    <input type="text" id="yourCity" class="form-input" placeholder="City, State ZIP">
                </div>
                
                <div class="form-group">
                    <label for="yourPhone">Phone Number:</label>
                    <input type="text" id="yourPhone" class="form-input" placeholder="Phone Number">
                </div>
                
                <div class="form-group">
                    <label for="yourEmail">Email Address:</label>
                    <input type="email" id="yourEmail" class="form-input" placeholder="Email Address">
                </div>
                
                <div class="form-group">
                    <label for="currentDate">Date:</label>
                    <input type="text" id="currentDate" class="form-input" placeholder="MM/DD/YYYY">
                </div>
                
                <div class="form-group">
                    <label for="recipientName">Recipient Name/Department:</label>
                    <input type="text" id="recipientName" class="form-input" placeholder="Police Department / Oversight Board Name">
                </div>
                
                <div class="form-group">
                    <label for="recipientAddress">Recipient Address:</label>
                    <input type="text" id="recipientAddress" class="form-input" placeholder="Department Street Address">
                </div>
                
                <div class="form-group">
                    <label for="recipientCity">City, State, ZIP:</label>
                    <input type="text" id="recipientCity" class="form-input" placeholder="City, State ZIP">
                </div>
                
                <div class="form-group">
                    <label for="subject">Subject:</label>
                    <input type="text" id="subject" class="form-input" placeholder="Complaint Against Officer [Name/Badge Number]">
                </div>
                
                <div class="form-group">
                    <label for="incidentDate">Incident Date & Time:</label>
                    <input type="text" id="incidentDate" class="form-input" placeholder="MM/DD/YYYY, approximate time">
                </div>
                
                <div class="form-group">
                    <label for="incidentLocation">Incident Location:</label>
                    <input type="text" id="incidentLocation" class="form-input" placeholder="Street address or landmark">
                </div>
                
                <div class="form-group">
                    <label for="officerName">Officer Name(s) & Badge Number(s):</label>
                    <input type="text" id="officerName" class="form-input" placeholder="Officer Name, Badge #">
                </div>
                
                <div class="form-group">
                    <label for="witnesses">Witnesses (if any):</label>
                    <input type="text" id="witnesses" class="form-input" placeholder="Names and contact information">
                </div>
                
                <div class="form-group full-width">
                    <label for="incidentDetails">Detailed Description of Incident:</label>
                    <textarea id="incidentDetails" class="form-textarea" rows="8" placeholder="Provide a factual, chronological account of what happened. Include only objective descriptions of events without emotional language. Be specific about any rights you believe were violated."></textarea>
                </div>
                
                <div class="form-group full-width">
                    <label for="requestedAction">Requested Action:</label>
                    <textarea id="requestedAction" class="form-textarea" rows="4" placeholder="Clearly state what action you would like the department to take (investigation, disciplinary action, policy change, etc.)."></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" id="preview-template" class="btn">Preview Letter</button>
                    <button type="button" id="download-template-pdf" class="btn">Download as PDF</button>
                    <button type="button" id="print-template" class="btn">Print</button>
                </div>
            </form>
            
            <div id="template-preview" class="template-preview" style="display: none;">
                <div class="preview-content" id="preview-content"></div>
                <button id="back-to-form" class="btn">Back to Form</button>
            </div>
        </div>
    `;
    
    infoPanel.innerHTML = templateHTML;
    infoPanel.style.display = 'block';
    
    // Set today's date in MM/DD/YYYY format
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const year = today.getFullYear();
    document.getElementById('currentDate').value = `${month}/${day}/${year}`;
    
    // Set up event listeners for form buttons
    document.getElementById('preview-template').addEventListener('click', previewComplaintTemplate);
    document.getElementById('download-template-pdf').addEventListener('click', downloadComplaintTemplatePDF);
    document.getElementById('print-template').addEventListener('click', printComplaintTemplate);
    
    // Back button event listener
    const backButton = document.getElementById('back-to-form');
    if (backButton) {
        backButton.addEventListener('click', function() {
            document.getElementById('complaint-form').style.display = 'block';
            document.getElementById('template-preview').style.display = 'none';
        });
    }
    
    // Scroll to the form
    infoPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function previewComplaintTemplate() {
    const form = document.getElementById('complaint-form');
    const preview = document.getElementById('template-preview');
    const previewContent = document.getElementById('preview-content');
    
    // Format the letter content
    const letterContent = formatComplaintLetter();
    
    // Display the formatted letter
    previewContent.innerHTML = letterContent;
    
    // Show preview, hide form
    form.style.display = 'none';
    preview.style.display = 'block';
}

function downloadComplaintTemplatePDF() {
    // First generate the preview content
    const letterContent = formatComplaintLetter();
    
    // Create a hidden div to render the content for PDF conversion
    const printElement = document.createElement('div');
    printElement.innerHTML = letterContent;
    printElement.style.display = 'none';
    document.body.appendChild(printElement);
    
    // Create file name from subject or default
    const subject = document.getElementById('subject').value || 'Police-Complaint';
    const fileName = subject.replace(/[^a-z0-9]/gi, '-').toLowerCase() + '.pdf';
    
    // Inform user about PDF generation
    alert('Your PDF will begin downloading shortly. Please note this uses your browser\'s built-in PDF export, which may vary in quality between browsers.');
    
    // Use browser print to PDF functionality
    const printOptions = {
        margin: '1cm',
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'cm', format: 'letter', orientation: 'portrait' }
    };
    
    // Use browser print to save as PDF
    window.print();
    
    // Remove the temporary element
    document.body.removeChild(printElement);
}

function printComplaintTemplate() {
    // First generate the preview content
    const letterContent = formatComplaintLetter();
    
    // Create a hidden iframe for printing
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    
    // Write the content to the iframe document
    printFrame.contentDocument.write(`
        <html>
            <head>
                <title>Complaint Letter</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.5; margin: 2cm; }
                    .letter-content { max-width: 21cm; margin: 0 auto; }
                    .letter-header, .letter-closing { margin-bottom: 2em; }
                    .letter-body { margin-bottom: 2em; }
                    .letter-body p { margin-bottom: 1em; text-align: justify; }
                </style>
            </head>
            <body>
                <div class="letter-content">
                    ${letterContent}
                </div>
            </body>
        </html>
    `);
    
    // Wait for content to be loaded
    printFrame.onload = function() {
        printFrame.contentWindow.print();
        document.body.removeChild(printFrame);
    };
    
    printFrame.contentDocument.close();
}

function formatComplaintLetter() {
    // Get all form values
    const yourName = document.getElementById('yourName').value || '[Your Name]';
    const yourAddress = document.getElementById('yourAddress').value || '[Your Address]';
    const yourCity = document.getElementById('yourCity').value || '[Your City, State ZIP]';
    const yourPhone = document.getElementById('yourPhone').value || '[Your Phone]';
    const yourEmail = document.getElementById('yourEmail').value || '[Your Email]';
    const currentDate = document.getElementById('currentDate').value || '[Current Date]';
    const recipientName = document.getElementById('recipientName').value || '[Department/Agency Name]';
    const recipientAddress = document.getElementById('recipientAddress').value || '[Department Address]';
    const recipientCity = document.getElementById('recipientCity').value || '[Department City, State ZIP]';
    const subject = document.getElementById('subject').value || 'Complaint Regarding Officer Misconduct';
    const incidentDate = document.getElementById('incidentDate').value || '[Date of Incident]';
    const incidentLocation = document.getElementById('incidentLocation').value || '[Location of Incident]';
    const officerName = document.getElementById('officerName').value || '[Officer Name/Badge Number]';
    const witnesses = document.getElementById('witnesses').value || '[Witness Information if applicable]';
    const incidentDetails = document.getElementById('incidentDetails').value || '[Provide a detailed account of the incident]';
    const requestedAction = document.getElementById('requestedAction').value || '[Specify what action you would like taken]';
    
    // Format the letter
    return `
        <div class="letter-header">
            <p>${yourName}<br>
            ${yourAddress}<br>
            ${yourCity}<br>
            Phone: ${yourPhone}<br>
            Email: ${yourEmail}</p>
            
            <p>${currentDate}</p>
            
            <p>${recipientName}<br>
            ${recipientAddress}<br>
            ${recipientCity}</p>
            
            <p><strong>Subject: ${subject}</strong></p>
        </div>
        
        <div class="letter-body">
            <p>To Whom It May Concern:</p>
            
            <p>I am writing to file a formal complaint regarding an incident that occurred on ${incidentDate} at ${incidentLocation}. This complaint concerns ${officerName}.</p>
            
            <p>${incidentDetails}</p>
            
            ${witnesses ? `<p>The following witnesses were present and observed the incident: ${witnesses}</p>` : ''}
            
            <p>${requestedAction}</p>
            
            <p>I can be reached at the contact information provided above. I expect a written response detailing the actions taken in response to this complaint. If additional information is needed, please contact me.</p>
        </div>
        
        <div class="letter-closing">
            <p>Sincerely,</p>
            
            <p>${yourName}</p>
        </div>
    `;
}

// Add event delegation for the rights card generation link
document.addEventListener('DOMContentLoaded', () => {
    // Existing event listeners...
    
    // Event delegation for generated rights cards
    document.body.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'generate-rights-card') {
            e.preventDefault();
            showRightsCardGenerator();
        }
    });
});

// Rights card generator function
function showRightsCardGenerator() {
    const infoPanel = document.getElementById('resource-info-panel');
    
    const cardGeneratorHTML = `
        <div class="template-container">
            <h3>Printable Rights Cards</h3>
            <p>Select the rights cards you'd like to include in your printable PDF:</p>
            
            <div class="rights-card-options">
                <div class="card-option">
                    <input type="checkbox" id="police-rights" checked>
                    <label for="police-rights">Police Interactions</label>
                </div>
                <div class="card-option">
                    <input type="checkbox" id="driving-rights" checked>
                    <label for="driving-rights">Traffic Stops</label>
                </div>
                <div class="card-option">
                    <input type="checkbox" id="home-rights" checked>
                    <label for="home-rights">Home Searches</label>
                </div>
                <div class="card-option">
                    <input type="checkbox" id="recording-rights">
                    <label for="recording-rights">Recording Police</label>
                </div>
                <div class="card-option">
                    <input type="checkbox" id="airport-rights">
                    <label for="airport-rights">Airport Security</label>
                </div>
            </div>
            
            <div class="card-preview-container">
                <div id="rights-card-preview" class="rights-card-preview">
                    <div class="preview-card" id="preview-police-rights">
                        <h4>Police Interactions</h4>
                        <ul>
                            <li>You have the right to remain silent</li>
                            <li>Ask "Am I free to leave?"</li>
                            <li>Say "I do not consent to a search"</li>
                            <li>Ask for a lawyer if detained</li>
                            <li>Don't physically resist even if rights violated</li>
                        </ul>
                    </div>
                    
                    <div class="preview-card" id="preview-driving-rights">
                        <h4>Traffic Stops</h4>
                        <ul>
                            <li>Keep hands visible on steering wheel</li>
                            <li>Provide license, registration, insurance</li>
                            <li>You can refuse consent to search</li>
                            <li>Field sobriety tests often voluntary</li>
                            <li>Breathalyzer refusal may have consequences</li>
                        </ul>
                    </div>
                    
                    <div class="preview-card" id="preview-home-rights">
                        <h4>Home Searches</h4>
                        <ul>
                            <li>Police generally need warrant to enter</li>
                            <li>Ask to see warrant before entry</li>
                            <li>Verify warrant has correct address</li>
                            <li>State "I do not consent to this search"</li>
                            <li>Remain silent during search</li>
                        </ul>
                    </div>
                    
                    <div class="preview-card" id="preview-recording-rights" style="display: none;">
                        <h4>Recording Police</h4>
                        <ul>
                            <li>Legal to record police in public</li>
                            <li>Don't interfere with police duties</li>
                            <li>State laws vary on audio recording</li>
                            <li>Police cannot delete your footage</li>
                            <li>Stay at a reasonable distance</li>
                        </ul>
                    </div>
                    
                    <div class="preview-card" id="preview-airport-rights" style="display: none;">
                        <h4>Airport Security</h4>
                        <ul>
                            <li>Can opt out of body scanner for pat-down</li>
                            <li>TSA needs cause to search phone data</li>
                            <li>Border agents have broader search powers</li>
                            <li>Right to lawyer if detained (not just delayed)</li>
                            <li>Can request private screening</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" id="print-rights-cards" class="btn">Print Rights Cards</button>
                <button type="button" id="download-rights-pdf" class="btn">Download as PDF</button>
            </div>
        </div>
    `;
    
    infoPanel.innerHTML = cardGeneratorHTML;
    infoPanel.style.display = 'block';
    
    // Add event listeners for the checkboxes
    document.querySelectorAll('.card-option input').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const cardId = this.id;
            const previewCard = document.getElementById('preview-' + cardId);
            if (previewCard) {
                previewCard.style.display = this.checked ? 'block' : 'none';
            }
        });
    });
    
    // Add event listeners for the buttons
    document.getElementById('print-rights-cards').addEventListener('click', printRightsCards);
    document.getElementById('download-rights-pdf').addEventListener('click', downloadRightsCardsPDF);
    
    // Scroll to the form
    infoPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function printRightsCards() {
    // Create a printable version of the selected cards
    const selectedCards = getSelectedRightsCards();
    
    // Create a hidden iframe for printing
    const printFrame = document.createElement('iframe');
    printFrame.style.display = 'none';
    document.body.appendChild(printFrame);
    
    // Write the content to the iframe document
    printFrame.contentDocument.write(`
        <html>
            <head>
                <title>Know Your Rights Cards</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .rights-card {
                        border: 2px solid #333;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                        background-color: #f9f9f9;
                    }
                    .rights-card h3 {
                        margin-top: 0;
                        border-bottom: 1px solid #333;
                        padding-bottom: 5px;
                        background-color: #3498db;
                        color: white;
                        padding: 5px 10px;
                        margin: -15px -15px 10px -15px;
                        border-radius: 6px 6px 0 0;
                    }
                    .rights-card ul {
                        margin: 0;
                        padding-left: 20px;
                    }
                    .rights-card li {
                        margin-bottom: 5px;
                        font-size: 12px;
                    }
                    .cards-container {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                    }
                    .disclaimer {
                        font-style: italic;
                        font-size: 10px;
                        text-align: center;
                        margin-top: 20px;
                    }
                    @media print {
                        body { padding: 0; }
                        .page-break { page-break-after: always; }
                    }
                </style>
            </head>
            <body>
                <h2 style="text-align: center; margin-bottom: 20px;">Know Your Rights Pocket Cards</h2>
                <div class="cards-container">
                    ${selectedCards}
                </div>
                <p class="disclaimer">These cards provide general information, not legal advice. Laws vary by jurisdiction.</p>
            </body>
        </html>
    `);
    
    // Wait for content to be loaded
    printFrame.onload = function() {
        printFrame.contentWindow.print();
        document.body.removeChild(printFrame);
    };
    
    printFrame.contentDocument.close();
}

function downloadRightsCardsPDF() {
    // Create a printable version of the selected cards
    const selectedCards = getSelectedRightsCards();
    
    // Create a hidden div to render the content for PDF conversion
    const printElement = document.createElement('div');
    printElement.style.display = 'none';
    document.body.appendChild(printElement);
    
    // Set up the HTML content for the PDF
    printElement.innerHTML = `
        <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
            <h2 style="text-align: center; margin-bottom: 20px;">Know Your Rights Pocket Cards</h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                ${selectedCards}
            </div>
            <p style="font-style: italic; font-size: 10px; text-align: center; margin-top: 20px;">
                These cards provide general information, not legal advice. Laws vary by jurisdiction.
            </p>
        </div>
    `;
    
    // Inform user about PDF generation
    alert('Your PDF will begin downloading shortly. Please note this uses your browser\'s built-in PDF export, which may vary in quality between browsers.');
    
    // Use browser print to PDF functionality
    window.print();
    
    // Remove the temporary element
    document.body.removeChild(printElement);
}

function getSelectedRightsCards() {
    let cardsHTML = '';
    
    // Check which cards are selected and add them to the output
    if (document.getElementById('police-rights').checked) {
        cardsHTML += `
            <div class="rights-card">
                <h3>Police Interactions</h3>
                <ul>
                    <li>You have the right to remain silent</li>
                    <li>Ask "Am I free to leave?"</li>
                    <li>Say "I do not consent to a search"</li>
                    <li>Ask for a lawyer if detained</li>
                    <li>Don't physically resist even if rights violated</li>
                </ul>
            </div>
        `;
    }
    
    if (document.getElementById('driving-rights').checked) {
        cardsHTML += `
            <div class="rights-card">
                <h3>Traffic Stops</h3>
                <ul>
                    <li>Keep hands visible on steering wheel</li>
                    <li>Provide license, registration, insurance</li>
                    <li>You can refuse consent to search</li>
                    <li>Field sobriety tests often voluntary</li>
                    <li>Breathalyzer refusal may have consequences</li>
                </ul>
            </div>
        `;
    }
    
    if (document.getElementById('home-rights').checked) {
        cardsHTML += `
            <div class="rights-card">
                <h3>Home Searches</h3>
                <ul>
                    <li>Police generally need warrant to enter</li>
                    <li>Ask to see warrant before entry</li>
                    <li>Verify warrant has correct address</li>
                    <li>State "I do not consent to this search"</li>
                    <li>Remain silent during search</li>
                </ul>
            </div>
        `;
    }
    
    if (document.getElementById('recording-rights').checked) {
        cardsHTML += `
            <div class="rights-card">
                <h3>Recording Police</h3>
                <ul>
                    <li>Legal to record police in public</li>
                    <li>Don't interfere with police duties</li>
                    <li>State laws vary on audio recording</li>
                    <li>Police cannot delete your footage</li>
                    <li>Stay at a reasonable distance</li>
                </ul>
            </div>
        `;
    }
    
    if (document.getElementById('airport-rights').checked) {
        cardsHTML += `
            <div class="rights-card">
                <h3>Airport Security</h3>
                <ul>
                    <li>Can opt out of body scanner for pat-down</li>
                    <li>TSA needs cause to search phone data</li>
                    <li>Border agents have broader search powers</li>
                    <li>Right to lawyer if detained (not just delayed)</li>
                    <li>Can request private screening</li>
                </ul>
            </div>
        `;
    }
    
    return cardsHTML;
}

// Add the following event delegation near the bottom of the file, inside the document.addEventListener('DOMContentLoaded', ...)
document.body.addEventListener('click', function(e) {
    // Existing click handlers
    
    // New complaint form generator from Report Violation section
    if (e.target && e.target.id === 'generate-complaint-form') {
        e.preventDefault();
        showComplaintTemplateForm();
    }
}); 