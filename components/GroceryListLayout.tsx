import { GroceryList } from "@/components/GroceryList";
import { GroceryListRecipe } from "@/lib/types";

interface GroceryListTabProps {
  groceryItems: GroceryListRecipe[];
  onUpdateItemsAction: (
    items: GroceryListRecipe[] | ((prevItems: GroceryListRecipe[]) => GroceryListRecipe[])
  ) => void;
}

export function GroceryListTab({
  groceryItems,
  onUpdateItemsAction,
}: GroceryListTabProps) {
  return (
    <div className="space-y-6">
      <GroceryList
        items={groceryItems}
        onUpdateItemsAction={onUpdateItemsAction}
      />
    </div>
  );
}