import clsx from 'clsx';
import styles from './index.module.scss';

interface IconProps {
  name: string;
  className?: string;
}

export default function Icon({ name, className }: IconProps) {
  return (
    <svg className={clsx(styles.icon, className)}>
      <use xlinkHref={`#${name}`} />
    </svg>
  );
}
