import styles from './Index.module.css';

const Skeleton = ({ width = '100%', height = '1em', radius = '6px', circle = false, className = '', style = {} }) => (
  <span
    className={`${styles.skeleton} ${className}`}
    style={{ width, height, borderRadius: circle ? '50%' : radius, ...style }}
  />
);

export default Skeleton;
export { Skeleton };
