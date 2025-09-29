import React from 'react';
import type { Theme } from '../hooks/useTheme';
import { MoonIcon, SunIcon, ChatBubbleLeftRightIcon, CheckIcon } from './icons';
import { 
  FiMoon, 
  FiSun, 
  FiMessageSquare, 
  FiCheck, 
  FiArrowRight,
  FiZap,
  FiSettings,
  FiShield,
  FiChevronRight
} from 'react-icons/fi';
import { BackgroundAnimation } from './BackgroundAnimation';

interface LandingPageProps {
    onGetStarted: () => void;
    theme: Theme;
    toggleTheme: () => void;
}

const LandingHeader: React.FC<Omit<LandingPageProps, 'onGetStarted' | 'onLoginClick'> & { onLoginClick: () => void }> = ({ theme, toggleTheme, onLoginClick }) => {
    return (
        <header className="bg-white/90 backdrop-blur-sm sticky top-0 z-20 border-b border-orange-100 shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <ChatBubbleLeftRightIcon className="w-7 h-7 text-orange-500" />
                        <h1 className="text-xl font-bold text-gray-900">Abstract</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onLoginClick}
                            className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                        >
                            Log In
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg text-gray-500 hover:bg-orange-50 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={onLoginClick}
                            className="ml-2 px-4 py-2 rounded-md text-sm font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    );
};

const FeatureCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
}> = ({ icon, title, description }) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-orange-50 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                <div className="w-6 h-6 text-orange-500">{icon}</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
};

const PricingCard: React.FC<{
    planName: string;
    price: string;
    priceDescription: string;
    features: string[];
    isFeatured?: boolean;
    onSelectPlan: () => void;
}> = ({ planName, price, priceDescription, features, isFeatured = false, onSelectPlan }) => {
    const cardClasses = `rounded-xl border p-6 flex flex-col transition-all ${isFeatured ? 'bg-orange-50 border-orange-200 shadow-lg' : 'bg-white border-gray-200'}`;
    const textColor = isFeatured ? 'text-gray-700' : 'text-gray-600';
    const headingColor = 'text-gray-900';
    const buttonClasses = `w-full mt-auto py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${isFeatured ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md' : 'bg-white text-orange-600 border border-orange-200 hover:border-orange-300 hover:bg-orange-50'}`;

    return (
        <div className={cardClasses}>
            <h3 className={`text-2xl font-bold ${headingColor}`}>{planName}</h3>
            <p className={`mt-2 ${textColor}`}>{priceDescription}</p>
            <p className="mt-4">
                <span className={`text-5xl font-extrabold ${headingColor}`}>{price}</span>
                <span className={`ml-1 ${textColor}`}>{price !== 'Free' && '/ month'}</span>
            </p>
            <ul className="mt-6 space-y-3 mb-8">
                {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                        <CheckIcon className={`w-5 h-5 ${isFeatured ? 'text-orange-500' : 'text-orange-400'}`} />
                        <span className={`${textColor}`}>{feature}</span>
                    </li>
                ))}
            </ul>
            <button onClick={onSelectPlan} className={buttonClasses}>
                Choose {planName}
                {isFeatured && <FiArrowRight />}
            </button>
        </div>
    );
};

const TestimonialCard: React.FC<{
    name: string;
    role: string;
    company: string;
    content: string;
    avatar: string;
}> = ({ name, role, company, content, avatar }) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-orange-50 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
                <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                    <h4 className="font-medium text-gray-900">{name}</h4>
                    <p className="text-sm text-gray-500">{role} • {company}</p>
                </div>
            </div>
            <p className="text-gray-600">"{content}"</p>
        </div>
    );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, theme, toggleTheme }) => {
    return (
        <div className="relative isolate overflow-hidden bg-white">
            <BackgroundAnimation />
            <div className="relative z-10 flex min-h-screen flex-col">
                <LandingHeader theme={theme} toggleTheme={toggleTheme} onLoginClick={onGetStarted} />
                <main className="flex-grow">
                    {/* Hero Section */}
                    <section className="py-20 sm:py-28 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white z-0"></div>
                        <div className="max-w-4xl mx-auto px-4 relative z-10">
                            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                                <FiSettings/>
                                <span>No coding required</span>
                            </div>
                            <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 tracking-tight">
                                Build AI Chatbots <span className="text-orange-500">in Minutes</span>
                            </h1>
                            <p className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto text-gray-600">
                                Create, customize, and deploy powerful AI-Powered chatbots for your website. No technical skills needed.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={onGetStarted}
                                    className="px-8 py-4 bg-orange-500 text-white font-medium rounded-lg shadow-md hover:bg-orange-600 transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    Get Started for Free
                                    <FiArrowRight/>
                                </button>
                                <button
                                    onClick={onGetStarted}
                                    className="px-8 py-4 bg-white text-orange-600 border border-orange-200 font-medium rounded-lg hover:bg-orange-50 transition-all duration-300"
                                >
                                    See Live Demo
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Logo Cloud */}
                    {/*<section className="py-12 bg-orange-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <p className="text-center text-sm font-medium text-gray-500 mb-8">TRUSTED BY COMPANIES WORLDWIDE</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-center">
                                {['KYN Designs and Tech', 'Nethub Dukel', 'Multiplex Designs', 'EOT Clothings'].map((company, index) => (
                                    <div key={index} className="flex items-center justify-center h-12 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all">
                                        <span className="text-xl font-bold text-gray-700">{company}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>*/}

                    {/* Features Section */}
                    <section className="py-20 sm:py-24">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                    Powerful Features for Your Chatbot
                                </h2>
                                <p className="mt-4 text-lg text-gray-600">
                                    Everything you need to create an exceptional chatbot experience
                                </p>
                            </div>
                            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <FeatureCard
                                    icon={<FiZap />}
                                    title="Easy Customization"
                                    description="Fully customize your chatbot's appearance and behavior to match your brand."
                                />
                                <FeatureCard
                                    icon={<FiShield />}
                                    title="Secure & Private"
                                    description="Enterprise-grade security to protect your data and your customers' privacy."
                                />
                                <FeatureCard
                                    icon={<FiSettings />}
                                    title="Fast Integration"
                                    description="Get your chatbot live on your website in minutes with simple embed codes."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Testimonials */}
                    <section className="py-20 bg-orange-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-3xl mx-auto">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                    Loved by Businesses
                                </h2>
                                <p className="mt-4 text-lg text-gray-600">
                                    Don't just take our word for it. Here's what our customers say.
                                </p>
                            </div>
                            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <TestimonialCard
                                    name="Onuorah Kingsley Ikenna"
                                    role="Graphic Designer"
                                    company="Multiplex Designs"
                                    content="Abstract helped us reduce customer support tickets by 40% while improving customer satisfaction scores."
                                    avatar="https://wzwyluzlsimmdohmwvvs.supabase.co/storage/v1/object/public/avatars/MS-05655.jpg"
                                />
                                <TestimonialCard
                                    name="Adzatsi Kelvin Selase"
                                    role="CEO"
                                    company="Nethub Dukel"
                                    content="Implementation took less than an hour and the results were immediate. Our conversion rates improved significantly."
                                    avatar="https://randomuser.me/api/portraits/men/32.jpg"
                                />
                                <TestimonialCard
                                    name="Esther Osiko Teye"
                                    role="E-commerce Manager"
                                    company="EOT Clothings"
                                    content="The customization options allowed us to create a chatbot that perfectly matches our brand identity."
                                    avatar="https://arnpggzvtelakimqhqjp.supabase.co/storage/v1/object/public/images/picture.jpg"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Pricing Section */}
                    <section id="pricing" className="py-20 sm:py-24">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                    Simple, Transparent Pricing
                                </h2>
                                <p className="mt-4 text-lg text-gray-600">
                                    Start for free, upgrade when you need more
                                </p>
                            </div>
                            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <PricingCard
                                    planName="Starter"
                                    price="Free"
                                    priceDescription="Perfect for individuals and small projects"
                                    features={[
                                        '1 Chatbot',
                                        '50 monthly conversations',
                                        'Basic customization',
                                        'Community support'
                                    ]}
                                    onSelectPlan={onGetStarted}
                                />
                                <PricingCard
                                    planName="Professional"
                                    price="GH₵50"
                                    priceDescription="For growing businesses and professionals"
                                    features={[
                                        '5 Chatbots',
                                        '1,000 monthly conversations',
                                        'Advanced customization',
                                        'Email support',
                                        'Analytics dashboard'
                                    ]}
                                    isFeatured={true}
                                    onSelectPlan={onGetStarted}
                                />
                                <PricingCard
                                    planName="Enterprise"
                                    price="GH₵120"
                                    priceDescription="For large-scale deployments"
                                    features={[
                                        'Unlimited chatbots',
                                        'Unlimited conversations',
                                        'Priority support',
                                        'API access',
                                        'Custom integrations',
                                        'Dedicated account manager'
                                    ]}
                                    onSelectPlan={onGetStarted}
                                />
                            </div>
                            <div className="mt-12 text-center">
                                <p className="text-gray-600">Need something custom? <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">Contact us</a></p>
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
                        <div className="max-w-4xl mx-auto px-4 text-center">
                            <h2 className="text-3xl sm:text-4xl font-bold text-white">
                                Ready to Transform Your Customer Experience?
                            </h2>
                            <p className="mt-4 text-lg text-orange-100 max-w-2xl mx-auto">
                                Join thousands of businesses using Abstract to enhance their customer support and engagement.
                            </p>
                            <div className="mt-10">
                                <button
                                    onClick={onGetStarted}
                                    className="px-8 py-4 bg-white text-orange-600 font-medium rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
                                >
                                    Get Started Now
                                    <FiArrowRight />
                                </button>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-white border-t border-orange-100">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Product</h3>
                                <ul className="space-y-3">
                                    {['Features', 'Pricing', 'Integrations', 'Updates'].map((item) => (
                                        <li key={item}>
                                            <a href="#" className="text-gray-600 hover:text-orange-600">{item}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Resources</h3>
                                <ul className="space-y-3">
                                    {['Documentation', 'Tutorials', 'Blog', 'Community'].map((item) => (
                                        <li key={item}>
                                            <a href="#" className="text-gray-600 hover:text-orange-600">{item}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Company</h3>
                                <ul className="space-y-3">
                                    {['About', 'Careers', 'Contact', 'Press'].map((item) => (
                                        <li key={item}>
                                            <a href="#" className="text-gray-600 hover:text-orange-600">{item}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-4">Legal</h3>
                                <ul className="space-y-3">
                                    {['Privacy', 'Terms', 'Security', 'Cookies'].map((item) => (
                                        <li key={item}>
                                            <a href="#" className="text-gray-600 hover:text-orange-600">{item}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="mt-12 pt-8 border-t border-orange-100 flex flex-col md:flex-row justify-between items-center">
                            <div className="flex items-center gap-2">
                                <ChatBubbleLeftRightIcon className="w-6 h-6 text-orange-500" />
                                <span className="font-bold text-gray-900">Abstract</span>
                            </div>
                            <p className="mt-4 md:mt-0 text-sm text-gray-500">
                                Powered By KYN Designs and Tech.
                            </p>
                            <p className="mt-4 md:mt-0 text-sm text-gray-500">
                                &copy; {new Date().getFullYear()} Abstract. All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};