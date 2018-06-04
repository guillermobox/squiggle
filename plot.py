import argparse
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.style
import numpy as np

parser = argparse.ArgumentParser(description='Plot data!')
parser.add_argument('--xlabel', default=None, help='This goes in the horizontal label')
parser.add_argument('--ylabel', default=None, help='This goes in the vertical label')
parser.add_argument('--title', default=None, help='Put a title over the graph')
parser.add_argument('--style', default='bmh', help='Select the matplotlib style')
parser.add_argument('--color', default='blue', help='Color to draw the data with')
parser.add_argument('--linestyle', default='solid', help='Draw the line joining the points with this style')
parser.add_argument('--marker', default="None", help='Matlab style marker to apply on the data')
parser.add_argument('inputfile', help='This is the file with the data to plot')

args = parser.parse_args()

matplotlib.style.use(args.style)
matplotlib.rcParams['savefig.dpi'] = 100.0;
matplotlib.rcParams['figure.figsize'] = (7.0, 5.0);

x,y = np.loadtxt(args.inputfile, unpack=True)

plt.plot(x, y,
        color=args.color,
        linestyle=args.linestyle,
        marker=args.marker)

if args.title:
    plt.title(args.title)
if args.xlabel:
    plt.xlabel(args.xlabel)
if args.ylabel:
    plt.ylabel(args.ylabel)

plt.tight_layout()
plt.savefig('out.png')
