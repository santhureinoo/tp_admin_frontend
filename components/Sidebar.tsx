import Link from "next/link";
import React from "react";
import { useRouter } from 'next/router';
const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const router = useRouter();
    return (
        <>
            <div onClick={e => {
                setSidebarOpen(!sidebarOpen);
            }} className={`${sidebarOpen ? 'block' : 'hidden'} fixed z-20 inset-0 bg-white opacity-50 transition-opacity lg:hidden`}></div>
            <div className={`${sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'} fixed z-30 inset-y-0 left-0 w-64 transition duration-300 transform bg-white overflow-y-auto lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex items-start pt-8 px-4">
                    <div className="flex">
                        <span className="text-2xl mx-2 font-semibold">Welcome,<br />Admin</span>
                    </div>
                </div>

                <nav className="mt-10 space-y-3 px-2">
                    <Link href="/">
                        <a className={router.pathname == "/" ? "link-active" : "link"}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="25"
                                height="12"
                                data-name="Layer 1"
                            >
                                <path
                                    fill="#426373"
                                    stroke="null"
                                    d="M3.725 8.219a1.807 1.807 0 01-.153-.195 8.57 8.57 0 01-.322-.479l-.512-.808a1.42 1.42 0 01-.294-.744.543.543 0 01.345-.532c-.018-.305-.03-.615-.03-.923 0-.18 0-.366.01-.545a1.529 1.529 0 01.063-.339A1.947 1.947 0 013.7 2.552a2.822 2.822 0 01.47-.216c.297-.11.153-.565.48-.573.764-.02 2.02.635 2.509 1.169a1.84 1.84 0 01.5 1.256l-.03 1.338a.378.378 0 01.276.274 1.147 1.147 0 01-.144.705h0c0 .012-.01.012-.01.022l-.584.96a7.74 7.74 0 01-.423.64c-.181.244-.331.195-.175.433a1.712 1.712 0 00.247.257c-1.118.496-1.996 1.344-1.996 3.34H0c0-3.048 2.662-2.078 3.774-3.61.129-.196.096-.174-.049-.328zm6.791-.286c-.352-.312-.794-.585-.853-1.233h-.039a.499.499 0 01-.25-.066A.684.684 0 019.1 6.3c-.126-.292-.227-1.058.092-1.278l-.06-.039V4.9c-.012-.154-.016-.341-.02-.538-.012-.72-.025-1.593-.606-1.768l-.247-.076.164-.195A9.398 9.398 0 019.873.848 3.714 3.714 0 0111.54.024a2.025 2.025 0 011.633.458 2.921 2.921 0 01.439.44 1.858 1.858 0 011.308.765 2.629 2.629 0 01.427.86 2.993 2.993 0 01.115.973 2.337 2.337 0 01-.68 1.581.518.518 0 01.212.055c.242.128.25.41.195.646-.062.195-.142.425-.218.616-.092.259-.224.307-.483.28-.012.633-.475.892-.87 1.26.973 1.803 4.755.613 4.755 4.199H5.741c0-3.586 3.7-2.337 4.771-4.222l.004-.002zm7.056.424a2.25 2.25 0 01-.148-.183 8.337 8.337 0 01-.31-.463l-.493-.78a1.363 1.363 0 01-.286-.718.524.524 0 01.335-.512c-.018-.294-.03-.594-.03-.89v-.528a1.408 1.408 0 01.06-.325 1.875 1.875 0 01.837-1.063 2.578 2.578 0 01.455-.218c.287-.106.148-.546.464-.552.736-.019 1.947.612 2.42 1.124a1.774 1.774 0 01.483 1.211l-.03 1.292a.358.358 0 01.266.264 1.098 1.098 0 01-.138.68h0s-.01 0-.01.02l-.56.927c-.13.208-.26.422-.408.619-.177.234-.321.195-.171.417 1.075 1.478 3.622.545 3.622 3.484h-4.65c0-1.895-.81-2.764-1.856-3.274a1.73 1.73 0 00.183-.21c.122-.182.091-.168-.049-.316l.014-.006z"
                                ></path>
                            </svg>
                            <span className="mx-3">Customer</span>
                        </a>
                    </Link>
                    <Link href="/Outlets">
                        <a className={router.pathname == "/Outlets" ? "link-active" : "link"}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="22">
                                <g fill="#33666C">
                                    <path
                                        fill="#33666C"
                                        fillRule="evenodd"
                                        stroke="null"
                                        d="M1.758 3.202H3.81v16.553H1.758C.79 19.755 0 18.965 0 17.997V4.957c0-.966.79-1.755 1.758-1.755h0zm8.707-3.407h3.497c1.088 0 1.977.89 1.977 1.977v1.056h-1.26v-1.06a.695.695 0 00-.693-.694h-3.545a.695.695 0 00-.694.694v1.06h-1.26V1.772c0-1.088.89-1.977 1.978-1.977h0zm-5.61 3.407H19.48v16.553H4.854V3.202h0zm15.67 0h2.287c.965 0 1.757.79 1.757 1.757V18c0 .966-.79 1.758-1.757 1.758h-2.288V3.202h0z"
                                        className="st0"
                                        clipRule="evenodd"
                                    ></path>
                                </g>
                            </svg>
                            <span className="mx-3">Outlet</span>
                        </a>
                    </Link>
                    {/* <a className="flex items-center mt-4 py-2 px-6 text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100" href="/">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                        </svg>

                        <span className="mx-3">Equipment</span>
                    </a>

                    <a className="flex items-center mt-4 py-2 px-6 text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100" href="/">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                        </svg>

                        <span className="mx-3">User</span>
                    </a>


                    <a className="flex items-center mt-4 py-2 px-6 text-gray-500 hover:bg-gray-700 hover:bg-opacity-25 hover:text-gray-100" href="/">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                        </svg>

                        <span className="mx-3">Billing</span>
                    </a> */}
                </nav>
            </div>
        </>
    )
}

export default Sidebar;