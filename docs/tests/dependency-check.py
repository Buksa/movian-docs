#!/usr/bin/env python3
"""
Movian Dependency Validation Script

This script validates that all required dependencies are available
for building Movian on the current platform.
"""

import os
import sys
import subprocess
import platform
import json
from pathlib import Path
from typing import Dict, List, Tuple, Optional

class Colors:
    """ANSI color codes for terminal output"""
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    BOLD = '\033[1m'
    NC = '\033[0m'  # No Color

class DependencyChecker:
    """Main dependency checking class"""
    
    def __init__(self):
        self.platform_info = self._detect_platform()
        self.results = {
            'platform': self.platform_info,
            'tools': {},
            'libraries': {},
            'optional': {},
            'errors': [],
            'warnings': []
        }
    
    def _detect_platform(self) -> Dict[str, str]:
        """Detect the current platform and distribution"""
        system = platform.system().lower()
        machine = platform.machine()
        
        info = {
            'system': system,
            'machine': machine,
            'distribution': 'unknown',
            'version': 'unknown'
        }
        
        if system == 'linux':
            info.update(self._detect_linux_distro())
        elif system == 'darwin':
            info['distribution'] = 'macos'
            info['version'] = platform.mac_ver()[0]
        elif system == 'windows':
            info['distribution'] = 'windows'
            info['version'] = platform.win32_ver()[1]
        
        return info
    
    def _detect_linux_distro(self) -> Dict[str, str]:
        """Detect Linux distribution"""
        try:
            # Try /etc/os-release first (systemd standard)
            with open('/etc/os-release', 'r') as f:
                lines = f.readlines()
            
            os_info = {}
            for line in lines:
                if '=' in line:
                    key, value = line.strip().split('=', 1)
                    os_info[key] = value.strip('"')
            
            return {
                'distribution': os_info.get('ID', 'unknown'),
                'version': os_info.get('VERSION_ID', 'unknown')
            }
        except FileNotFoundError:
            # Fallback methods
            if Path('/etc/debian_version').exists():
                return {'distribution': 'debian', 'version': 'unknown'}
            elif Path('/etc/redhat-release').exists():
                return {'distribution': 'rhel', 'version': 'unknown'}
            elif Path('/etc/arch-release').exists():
                return {'distribution': 'arch', 'version': 'unknown'}
            else:
                return {'distribution': 'unknown', 'version': 'unknown'}
    
    def _run_command(self, cmd: List[str], capture_output: bool = True) -> Tuple[bool, str]:
        """Run a command and return success status and output"""
        try:
            result = subprocess.run(
                cmd,
                capture_output=capture_output,
                text=True,
                timeout=30
            )
            return result.returncode == 0, result.stdout.strip()
        except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.SubprocessError):
            return False, ""
    
    def check_tool(self, tool: str, version_flag: str = '--version') -> Dict[str, any]:
        """Check if a tool is available and get its version"""
        success, output = self._run_command([tool, version_flag])
        
        result = {
            'available': success,
            'version': output.split('\n')[0] if success else None,
            'path': None
        }
        
        if success:
            path_success, path_output = self._run_command(['which', tool])
            if path_success:
                result['path'] = path_output
        
        return result
    
    def check_pkg_config_library(self, library: str) -> Dict[str, any]:
        """Check if a library is available via pkg-config"""
        # Check existence
        exists_success, _ = self._run_command(['pkg-config', '--exists', library])
        
        result = {
            'available': exists_success,
            'version': None,
            'cflags': None,
            'libs': None
        }
        
        if exists_success:
            # Get version
            version_success, version_output = self._run_command(['pkg-config', '--modversion', library])
            if version_success:
                result['version'] = version_output
            
            # Get compile flags
            cflags_success, cflags_output = self._run_command(['pkg-config', '--cflags', library])
            if cflags_success:
                result['cflags'] = cflags_output
            
            # Get link flags
            libs_success, libs_output = self._run_command(['pkg-config', '--libs', library])
            if libs_success:
                result['libs'] = libs_output
        
        return result
    
    def check_header_file(self, header: str, include_paths: List[str] = None) -> bool:
        """Check if a header file is available"""
        if include_paths is None:
            include_paths = ['/usr/include', '/usr/local/include']
        
        for path in include_paths:
            header_path = Path(path) / header
            if header_path.exists():
                return True
        
        return False
    
    def check_build_tools(self):
        """Check availability of build tools"""
        tools = {
            'git': {'version_flag': '--version', 'required': True},
            'make': {'version_flag': '--version', 'required': True},
            'gcc': {'version_flag': '--version', 'required': True},
            'g++': {'version_flag': '--version', 'required': True},
            'pkg-config': {'version_flag': '--version', 'required': True},
            'yasm': {'version_flag': '--version', 'required': True},
        }
        
        # Platform-specific tools
        if self.platform_info['system'] == 'darwin':
            tools.update({
                'xcode-select': {'version_flag': '--version', 'required': True},
                'brew': {'version_flag': '--version', 'required': False},
            })
        
        for tool, config in tools.items():
            result = self.check_tool(tool, config['version_flag'])
            self.results['tools'][tool] = result
            
            if config['required'] and not result['available']:
                self.results['errors'].append(f"Required tool not found: {tool}")
            elif not config['required'] and not result['available']:
                self.results['warnings'].append(f"Optional tool not found: {tool}")
    
    def check_libraries(self):
        """Check availability of required libraries"""
        required_libraries = [
            'freetype2',
            'fontconfig',
        ]
        
        optional_libraries = [
            'openssl',
            'x11',
            'xext',
            'gl',
            'sqlite3',
            'libpulse',
            'alsa',
        ]
        
        # Platform-specific libraries
        if self.platform_info['system'] == 'linux':
            required_libraries.extend(['x11', 'xext'])
            optional_libraries.extend(['libvdpau', 'libxss', 'libxxf86vm', 'libxv'])
        
        # Check required libraries
        for lib in required_libraries:
            result = self.check_pkg_config_library(lib)
            self.results['libraries'][lib] = result
            
            if not result['available']:
                self.results['errors'].append(f"Required library not found: {lib}")
        
        # Check optional libraries
        for lib in optional_libraries:
            result = self.check_pkg_config_library(lib)
            self.results['optional'][lib] = result
            
            if not result['available']:
                self.results['warnings'].append(f"Optional library not found: {lib}")
    
    def check_compiler_features(self):
        """Check compiler support for required features"""
        # Test C99 support
        c99_test = '''
        #include <stdio.h>
        int main() {
            // C99 features
            for (int i = 0; i < 1; i++) {
                printf("C99 support OK\\n");
            }
            return 0;
        }
        '''
        
        # Test C++11 support
        cpp11_test = '''
        #include <iostream>
        #include <vector>
        int main() {
            // C++11 features
            auto vec = std::vector<int>{1, 2, 3};
            for (auto& item : vec) {
                std::cout << "C++11 support OK" << std::endl;
            }
            return 0;
        }
        '''
        
        # Create temporary files and test compilation
        import tempfile
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.c', delete=False) as f:
            f.write(c99_test)
            c_file = f.name
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.cpp', delete=False) as f:
            f.write(cpp11_test)
            cpp_file = f.name
        
        try:
            # Test C99
            c99_success, _ = self._run_command(['gcc', '-std=c99', '-o', '/dev/null', c_file])
            self.results['tools']['gcc_c99'] = {'available': c99_success}
            
            if not c99_success:
                self.results['errors'].append("GCC does not support C99")
            
            # Test C++11
            cpp11_success, _ = self._run_command(['g++', '-std=c++11', '-o', '/dev/null', cpp_file])
            self.results['tools']['gxx_cpp11'] = {'available': cpp11_success}
            
            if not cpp11_success:
                self.results['errors'].append("G++ does not support C++11")
        
        finally:
            # Clean up temporary files
            try:
                os.unlink(c_file)
                os.unlink(cpp_file)
            except OSError:
                pass
    
    def generate_install_commands(self) -> Dict[str, List[str]]:
        """Generate platform-specific installation commands for missing dependencies"""
        commands = {}
        
        missing_tools = [tool for tool, result in self.results['tools'].items() 
                        if not result['available']]
        missing_libs = [lib for lib, result in self.results['libraries'].items() 
                       if not result['available']]
        
        distro = self.platform_info['distribution']
        
        if distro in ['ubuntu', 'debian']:
            packages = []
            
            # Tool packages
            if 'git' in missing_tools:
                packages.append('git')
            if 'make' in missing_tools or 'gcc' in missing_tools or 'g++' in missing_tools:
                packages.append('build-essential')
            if 'pkg-config' in missing_tools:
                packages.append('pkg-config')
            if 'yasm' in missing_tools:
                packages.append('yasm')
            
            # Library packages
            lib_packages = {
                'freetype2': 'libfreetype6-dev',
                'fontconfig': 'libfontconfig1-dev',
                'x11': 'libx11-dev',
                'xext': 'libxext-dev',
                'gl': 'libgl1-mesa-dev',
                'sqlite3': 'libsqlite3-dev',
                'libpulse': 'libpulse-dev',
                'alsa': 'libasound2-dev',
                'openssl': 'libssl-dev',
            }
            
            for lib in missing_libs:
                if lib in lib_packages:
                    packages.append(lib_packages[lib])
            
            if packages:
                commands['debian'] = [
                    'sudo apt-get update',
                    f'sudo apt-get install -y {" ".join(packages)}'
                ]
        
        elif distro in ['fedora', 'rhel', 'centos']:
            packages = []
            
            # Tool packages
            if any(tool in missing_tools for tool in ['make', 'gcc', 'g++']):
                packages.extend(['gcc', 'gcc-c++', 'make'])
            if 'git' in missing_tools:
                packages.append('git')
            if 'pkg-config' in missing_tools:
                packages.append('pkgconf-devel')
            if 'yasm' in missing_tools:
                packages.append('yasm')
            
            # Library packages
            lib_packages = {
                'freetype2': 'freetype-devel',
                'fontconfig': 'fontconfig-devel',
                'x11': 'libX11-devel',
                'xext': 'libXext-devel',
                'gl': 'mesa-libGL-devel',
                'sqlite3': 'sqlite-devel',
                'libpulse': 'pulseaudio-libs-devel',
                'alsa': 'alsa-lib-devel',
                'openssl': 'openssl-devel',
            }
            
            for lib in missing_libs:
                if lib in lib_packages:
                    packages.append(lib_packages[lib])
            
            if packages:
                pkg_manager = 'dnf' if distro == 'fedora' else 'yum'
                commands['fedora'] = [f'sudo {pkg_manager} install -y {" ".join(packages)}']
        
        elif distro == 'arch':
            packages = []
            
            if any(tool in missing_tools for tool in ['make', 'gcc', 'g++']):
                packages.append('base-devel')
            if 'git' in missing_tools:
                packages.append('git')
            if 'yasm' in missing_tools:
                packages.append('yasm')
            
            lib_packages = {
                'freetype2': 'freetype2',
                'fontconfig': 'fontconfig',
                'x11': 'libx11',
                'xext': 'libxext',
                'gl': 'mesa',
                'sqlite3': 'sqlite',
                'libpulse': 'pulseaudio',
                'alsa': 'alsa-lib',
                'openssl': 'openssl',
            }
            
            for lib in missing_libs:
                if lib in lib_packages:
                    packages.append(lib_packages[lib])
            
            if packages:
                commands['arch'] = [f'sudo pacman -S --needed {" ".join(packages)}']
        
        elif distro == 'macos':
            packages = []
            
            if 'yasm' in missing_tools:
                packages.append('yasm')
            if 'openssl' in missing_libs:
                packages.append('openssl')
            
            if packages:
                commands['macos'] = [f'brew install {" ".join(packages)}']
        
        return commands
    
    def print_results(self):
        """Print formatted results"""
        print(f"{Colors.BOLD}Movian Dependency Check Results{Colors.NC}")
        print("=" * 50)
        
        # Platform info
        print(f"{Colors.BLUE}Platform:{Colors.NC} {self.platform_info['system']} "
              f"({self.platform_info['distribution']} {self.platform_info['version']})")
        print(f"{Colors.BLUE}Architecture:{Colors.NC} {self.platform_info['machine']}")
        print()
        
        # Tools
        print(f"{Colors.BOLD}Build Tools:{Colors.NC}")
        for tool, result in self.results['tools'].items():
            status = f"{Colors.GREEN}✓{Colors.NC}" if result['available'] else f"{Colors.RED}✗{Colors.NC}"
            version = f" ({result.get('version', 'unknown')})" if result['available'] else ""
            print(f"  {status} {tool}{version}")
        print()
        
        # Required libraries
        print(f"{Colors.BOLD}Required Libraries:{Colors.NC}")
        for lib, result in self.results['libraries'].items():
            status = f"{Colors.GREEN}✓{Colors.NC}" if result['available'] else f"{Colors.RED}✗{Colors.NC}"
            version = f" ({result.get('version', 'unknown')})" if result['available'] else ""
            print(f"  {status} {lib}{version}")
        print()
        
        # Optional libraries
        print(f"{Colors.BOLD}Optional Libraries:{Colors.NC}")
        for lib, result in self.results['optional'].items():
            status = f"{Colors.GREEN}✓{Colors.NC}" if result['available'] else f"{Colors.YELLOW}○{Colors.NC}"
            version = f" ({result.get('version', 'unknown')})" if result['available'] else ""
            print(f"  {status} {lib}{version}")
        print()
        
        # Errors and warnings
        if self.results['errors']:
            print(f"{Colors.RED}{Colors.BOLD}Errors:{Colors.NC}")
            for error in self.results['errors']:
                print(f"  {Colors.RED}✗{Colors.NC} {error}")
            print()
        
        if self.results['warnings']:
            print(f"{Colors.YELLOW}{Colors.BOLD}Warnings:{Colors.NC}")
            for warning in self.results['warnings']:
                print(f"  {Colors.YELLOW}!{Colors.NC} {warning}")
            print()
        
        # Installation commands
        install_commands = self.generate_install_commands()
        if install_commands:
            print(f"{Colors.BOLD}Suggested Installation Commands:{Colors.NC}")
            for platform, commands in install_commands.items():
                print(f"\n{Colors.BLUE}{platform.title()}:{Colors.NC}")
                for cmd in commands:
                    print(f"  {cmd}")
            print()
        
        # Summary
        total_errors = len(self.results['errors'])
        total_warnings = len(self.results['warnings'])
        
        if total_errors == 0:
            print(f"{Colors.GREEN}{Colors.BOLD}✓ Ready to build Movian!{Colors.NC}")
        else:
            print(f"{Colors.RED}{Colors.BOLD}✗ {total_errors} error(s) must be resolved before building{Colors.NC}")
        
        if total_warnings > 0:
            print(f"{Colors.YELLOW}! {total_warnings} warning(s) - some features may be disabled{Colors.NC}")
    
    def run_all_checks(self):
        """Run all dependency checks"""
        print("Checking build dependencies...")
        self.check_build_tools()
        self.check_libraries()
        self.check_compiler_features()
    
    def save_results(self, filename: str):
        """Save results to JSON file"""
        with open(filename, 'w') as f:
            json.dump(self.results, f, indent=2)

def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Check Movian build dependencies')
    parser.add_argument('--json', help='Save results to JSON file')
    parser.add_argument('--quiet', action='store_true', help='Only show errors')
    
    args = parser.parse_args()
    
    checker = DependencyChecker()
    checker.run_all_checks()
    
    if not args.quiet:
        checker.print_results()
    
    if args.json:
        checker.save_results(args.json)
    
    # Exit with error code if there are errors
    if checker.results['errors']:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == '__main__':
    main()