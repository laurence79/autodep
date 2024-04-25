/**
 * The intended lifecycle of constructed types.
 */
export enum Lifecycle {
  /**
   * A new object should be constructed for the type for each dependency.
   *
   * The container will hold a weak reference to the object, which if disposable
   * will be disposed along with the container if it hasn't already been garbage
   * collected.
   */
  transient = 'transient',

  /**
   * During a resolution, a maximum of one object of the type will be created
   * for each dependency.
   *
   * The container will hold a weak reference to the object, which if disposable
   * will be disposed along with the container if it hasn't already been garbage
   * collected.
   */
  perResolution = 'perResolution',

  /**
   * A maximum of one object of the type will be created in the container.
   * Child containers will have their own object of the type.
   *
   * The container will hold a strong reference to the object, which if
   * disposable will be disposed along with the container.
   */
  perContainer = 'perContainer',

  /**
   * A maximum of one object of the type will be created in the container.
   * Child containers will also resolve to this object.
   *
   * The container will hold a strong reference to the object, which if
   * disposable will be disposed along with the container.
   */
  singleton = 'singleton'
}
