import { NavLink } from '@remix-run/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/ui/atoms/tooltip';

export type NavItemProps = {
  label: string;
  content: string;
  icon?: React.ReactNode;
  href: string;
};

export const NavItem = ({ label, content, href, icon }: NavItemProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span>
          <NavLink
            to={href}
            className={({ isActive }) =>
              `flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8 ${isActive ? '!text-foreground' : ''}`
            }
          >
            {icon}
            <span className="sr-only">{label}</span>
          </NavLink>
        </span>
      </TooltipTrigger>
      <TooltipContent side="right">{content}</TooltipContent>
    </Tooltip>
  );
};
