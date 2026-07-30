"use client";

import Link from 'next/link';
import { Button } from '@/components/commonComponents/Button';
import { Card } from '@/components/commonComponents/Card';
import { HiOutlineHome, HiOutlineArrowLeft, HiOutlineExclamationCircle, HiOutlineXCircle, HiOutlineServer, HiOutlineShieldExclamation, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { IconType } from 'react-icons';

export type ErrorType = '404' | '500' | '403' | '401' | 'generic';

interface ErrorConfig {
  icon: IconType;
  code: string;
  title: string;
  description: string;
  iconBgColor: string;
  iconColor: string;
  codeColor: string;
}

const ERROR_CONFIGS: Record<ErrorType, ErrorConfig> = {
  '404': {
    icon: HiOutlineMagnifyingGlass,
    code: '404',
    title: 'Page Not Found',
    description: "The page you are looking for doesn't exist or has been moved.",
    iconBgColor: 'bg-blue-100 dark:bg-blue-950',
    iconColor: 'text-blue-600 dark:text-blue-400',
    codeColor: 'text-blue-600 dark:text-blue-400',
  },
  '500': {
    icon: HiOutlineServer,
    code: '500',
    title: 'Internal Server Error',
    description: 'Something went wrong on our end. Please try again later.',
    iconBgColor: 'bg-red-100 dark:bg-red-950',
    iconColor: 'text-red-600 dark:text-red-400',
    codeColor: 'text-red-600 dark:text-red-400',
  },
  '403': {
    icon: HiOutlineShieldExclamation,
    code: '403',
    title: 'Access Forbidden',
    description: "You don't have permission to access this resource.",
    iconBgColor: 'bg-orange-100 dark:bg-orange-950',
    iconColor: 'text-orange-600 dark:text-orange-400',
    codeColor: 'text-orange-600 dark:text-orange-400',
  },
  '401': {
    icon: HiOutlineShieldExclamation,
    code: '401',
    title: 'Unauthorized',
    description: 'You need to be authenticated to access this page.',
    iconBgColor: 'bg-yellow-100 dark:bg-yellow-950',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    codeColor: 'text-yellow-600 dark:text-yellow-400',
  },
  'generic': {
    icon: HiOutlineXCircle,
    code: 'Error',
    title: 'Something Went Wrong',
    description: 'An unexpected error occurred. Please try again.',
    iconBgColor: 'bg-gray-100 dark:bg-gray-800',
    iconColor: 'text-gray-600 dark:text-gray-400',
    codeColor: 'text-gray-600 dark:text-gray-400',
  },
};

interface ErrorPageProps {
  errorType?: ErrorType;
  customTitle?: string;
  customDescription?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  showSupportLink?: boolean;
  onSupportClick?: () => void;
  reset?: () => void;
}

const handleDefaultSupportClick = () => {
  alert('Contact your administrator for assistance');
};

const handleGoBack = () => {
  window.history.back();
};

export function ErrorPage({
  errorType = 'generic',
  customTitle,
  customDescription,
  showHomeButton = true,
  showBackButton = true,
  showSupportLink = true,
  onSupportClick,
  reset,
}: ErrorPageProps) {
  const config = ERROR_CONFIGS[errorType];
  const Icon = config.icon;
  const title = customTitle || config.title;
  const description = customDescription || config.description;
  const handleSupport = onSupportClick || handleDefaultSupportClick;

  return (
    <div className="flex h-full w-full items-center justify-center bg-background overflow-hidden">
      <div className="w-full max-w-lg px-4">
        <Card className="p-6 sm:p-8 shadow-xl text-center">
          {/* Icon and Title */}
          <div className="mb-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${config.iconBgColor} mb-4`}>
              <Icon className={`w-8 h-8 ${config.iconColor}`} />
            </div>
            <h1 className={`text-5xl font-semibold ${config.codeColor} mb-3`}>
              {config.code}
            </h1>
            <h2 className="text-xl font-bold text-foreground mb-2">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              {description}
            </p>
          </div>

          {/* Action Buttons */}
          {(showHomeButton || showBackButton || reset) && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              {showHomeButton && (
                <Link href="/">
                  <Button variant="default" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                    <HiOutlineHome className="w-4 h-4" />
                    Go to Dashboard
                  </Button>
                </Link>
              )}

              {reset && (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={reset}
                >
                  <HiOutlineExclamationCircle className="w-4 h-4" />
                  Try Again
                </Button>
              )}

              {showBackButton && !reset && (
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={handleGoBack}
                >
                  <HiOutlineArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
              )}
            </div>
          )}

          {/* Support Link */}
          {showSupportLink && (
            <div className="pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Need help?{' '}
                <button
                  className={`${config.iconColor.replace('dark:text', 'dark:hover:text').replace('text', 'hover:text')} font-medium underline`}
                  onClick={handleSupport}
                >
                  Contact support
                </button>
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
